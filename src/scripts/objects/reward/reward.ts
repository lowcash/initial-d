import { Range } from '../_common/common';
import TypeGuardHelper from '../_common/typeGuardHelper';
import { SpriteMappingSized } from '../_common/mappingHelper';

import Coin from './coin'
import PickupFx from './pickupFx'
import Map from '../map/map'
import Vehicle from '../traffic/vehicle';

import IMovable from '../interfaces/IMovable';
import { sourceModel } from '../../models/source';

export default class Reward implements IMovable {
    private readonly scene: Phaser.Scene;
    private readonly map: Map;

    private readonly depthLayer: number;

    private readonly coin: {
        soundKey: string;
    } & SpriteMappingSized = {
            key: 'coin',
            mappingKey: sourceModel.spriteCoin.mappingKey,
            soundKey: sourceModel.soundCoin.mappingKey,

            size: 32
        };

    private readonly coins: {
        objectMapper: { [id: string]: Coin };
        spriteMapper: { [id: string]: Phaser.Physics.Arcade.Sprite; };

        group?: Phaser.Physics.Arcade.Group;
        sound?: Phaser.Sound.BaseSound;

        numCreatedCoins: number;
    } = {
            objectMapper: {},
            spriteMapper: {},

            numCreatedCoins: 0
        };

    private player: Vehicle;

    private earnedPoints: number = 0;

    /** Fractional carry for distance-based score while driving. */
    private driveScoreCarry: number = 0;

    private frozen: boolean = false;

    private readonly onCoinCollidedHandler: (id: string) => void;
    private readonly onCoinDestroyedHandler: (id: string) => void;
    private readonly onMapSpeedChangedHandler: (speed: number) => void;

    speed: number = 0;

    constructor(scene: Phaser.Scene, map: Map, player: Vehicle, depthLayer: number = 0, numCoinsToGenerate: number) {
        this.scene = scene;
        this.map = map;
        this.player = player;

        this.depthLayer = depthLayer;

        this.onCoinCollidedHandler = (id: string) => this.handleCoinCollided(id);
        this.onCoinDestroyedHandler = (id: string) => this.handleCoinDestroyed(id);
        this.onMapSpeedChangedHandler = (speed: number) => this.handleMapSpeedChanged(speed);

        this.coins.sound = this.scene.sound.add(this.coin.soundKey, {});

        if (!this.scene.anims.exists(this.coin.key)) {
            this.scene.anims.create({
                key: this.coin.key,
                frames: this.scene.anims.generateFrameNumbers(this.coin.mappingKey, {}),
                frameRate: 20,
                repeat: -1
            });
        }

        this.generateReward(numCoinsToGenerate);

        // Coin events are Reward-only — wipe by name so prior restart handlers cannot
        // touch destroyed state (that freeze on first pickup after AGAIN).
        this.scene.events.off('onCoinCollided');
        this.scene.events.off('onCoinDestroyed');
        this.scene.events.on('onCoinCollided', this.onCoinCollidedHandler);
        this.scene.events.on('onCoinDestroyed', this.onCoinDestroyedHandler);

        // Shared with map/traffic/background — never wipe the whole channel.
        this.scene.events.on('onMapSpeedChanged', this.onMapSpeedChangedHandler);
    }

    public getEarnedPoints(): number {
        return this.earnedPoints;
    }

    /** Freeze pickups on crash — coins should not keep spinning while cars are frozen. */
    public freeze(): void {
        this.frozen = true;
        this.speed = 0;

        Object.values(this.coins.spriteMapper).forEach((sprite) => {
            if (sprite && sprite.active) {
                sprite.anims.pause();
            }
        });
    }

    /**
     * Survival / distance score — faster road = more points.
     * Coins remain the bigger burst reward on top of this.
     */
    public addDriveScore(deltaMs: number): void {
        const speedAbs = Math.abs(this.speed);
        if (speedAbs <= 0) {
            return;
        }

        // Slow drip so coins stay worth chasing (~1 pt / 700ms at base speed).
        this.driveScoreCarry += speedAbs * (deltaMs / 700);

        if (this.driveScoreCarry >= 1) {
            const gained = Math.floor(this.driveScoreCarry);
            this.driveScoreCarry -= gained;
            this.earnedPoints += gained;
            this.scene.events.emit('onScoreChanged', this.earnedPoints, gained);
        }
    }

    public generateReward(numCoinsToGenerate: number): void {
        this.frozen = false;
        this.clearReward();

        this.generateRandomCoins(
            numCoinsToGenerate,
            {
                from: this.map.getNumRoadChunks() - 2,
                to: this.map.getNumRoadChunks() - 1
            }
        );
    }

    public attachPlayer(player: Vehicle): void {
        this.player = player;

        const playerSprite = this.player.getSprite();

        Object.values(this.coins.objectMapper).map(o => o.registerCollision(playerSprite));
    }

    public generateCoin(gridPosX: Range | number): void {
        const _posX = TypeGuardHelper.isRange(gridPosX) ?
            this.map.getRandomRoadIdx(gridPosX.from, gridPosX.to) :
            this.map.getRandomRoadIdx(gridPosX);

        const _posY = this.map.getRandomLaneIdx(_posX);

        this.coin.sprite =
            this.scene.physics.add.sprite(
                this.map.getChunkCenter(_posX).x,
                this.map.getLanePosition(_posX, _posY),
                this.coin.mappingKey
            )
                .setOrigin(0.5, 1.0)
                // Half-step under vehicles in the same lane (cars use the integer depth).
                .setDepth(this.depthLayer + this.map.getNumRoadChunkLanes(_posX) - _posY - 0.5);

        this.coin.sprite?.anims.play(this.coin.key, true);

        this.coins.objectMapper[this.coins.numCreatedCoins.toString()] =
            new Coin(
                this.scene,
                this.coins.numCreatedCoins.toString(),
                this.coin.sprite,
                new Phaser.Math.Vector2(_posX, _posY),
                [this.player.getSprite()]
            );

        this.coins.spriteMapper[this.coins.numCreatedCoins.toString()] = this.coin.sprite;
    }

    public registerCoins(): void {
        // Rebuild group without destroying live sprites (replacement spawn path).
        if (this.coins.group) {
            this.coins.group.clear(false, false);
        }

        this.coins.group = this.scene.physics.add.group(
            Object.keys(this.coins.spriteMapper).map(c => this.coins.spriteMapper[c])
        );
    }

    public generateRandomCoins(numCoins: number, range: Range): void {
        for (let i = 0; i < numCoins; ++i) {
            this.generateCoin(
                {
                    from: range.from,
                    to: range.to
                }
            );

            this.coins.numCreatedCoins++;
        }

        this.registerCoins();
    }

    public move(): void {
        this.coins.group?.incX(this.speed);
    }

    private clearReward(): void {
        // Stop timers/tweens on every coin before wiping sprites (prevents zombie watchers).
        Object.values(this.coins.objectMapper).forEach((coin) => coin.dispose());

        this.coins.numCreatedCoins = 0;

        this.earnedPoints = 0;
        this.driveScoreCarry = 0;

        this.scene.events.emit('onScoreChanged', this.earnedPoints);

        this.coins.group?.clear(true, true);
        this.coins.group = undefined;

        this.coins.objectMapper = {};
        this.coins.spriteMapper = {};
    }

    private handleMapSpeedChanged(speed: number) {
        this.speed = speed;
    }

    private handleCoinCollided(id: string): void {
        const coinObject = this.coins.objectMapper[id];

        if (!coinObject) {
            return;
        }

        if (this.player.getLane() !== coinObject.getLane()) {
            return;
        }

        // Claim immediately — overlap can fire twice in one step.
        if (!coinObject.tryBeginCollect()) {
            return;
        }

        const points = coinObject.getRewardPoints();
        const pos = coinObject.getPosition();

        this.coins.sound?.play();

        this.earnedPoints += points;
        this.scene.events.emit('onScoreChanged', this.earnedPoints, points);

        const sprite = coinObject.getSprite();
        // Drop from the scrolling group — collect tween carries road speed itself
        // so the coin keeps drifting past the car instead of sticking.
        this.coins.group?.remove(sprite, false, false);

        // Remove from maps now so off-screen watcher won't double-spawn;
        // motion tween finishes the sprite, then we respawn a new coin.
        delete this.coins.objectMapper[id];
        delete this.coins.spriteMapper[id];

        // Same-beat FX + coin keeps scrolling past the car.
        PickupFx.play(this.scene, pos.x, pos.y - 8, points);
        coinObject.collectWithMotion(PickupFx.DURATION_MS, this.speed, () => {
            this.spawnReplacementCoin();
        });
    }

    private handleCoinDestroyed(id: string): void {
        if (this.coins.objectMapper[id]) {
            delete this.coins.objectMapper[id];
            delete this.coins.spriteMapper[id];
            this.spawnReplacementCoin();
        }
    }

    private spawnReplacementCoin(): void {
        if (this.frozen) {
            return;
        }

        this.generateRandomCoins(
            1,
            {
                from: this.map.getNumRoadChunks() - 2,
                to: this.map.getNumRoadChunks() - 1
            }
        );
    }
};
