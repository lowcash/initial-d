import { sourceModel } from '../models/source'
import { DeviceType, SettingsModel } from '../models/settings'

import BasicButton from '../objects/buttons/basicButton';
import MuteButton from '../objects/buttons/muteButton';
import { BackgroundTileSpriteMapping } from '../objects/tilesprites/backgroundTileSprite'
import { HUDFrameSettings } from '../objects/HUD';

import Map from '../objects/map/map'
import Vehicle from '../objects/traffic/vehicle'
import Traffic from '../objects/traffic/traffic'
import Reward from '../objects/reward/reward';
import ScoreHUD, { AppendFrom, ScoreHUDExtended } from '../objects/reward/hud';
import Common, { LayerIDX } from '../objects/_common/common';
import AudioHelper from '../objects/_common/audioHelper';
import ScoreStorage from '../objects/_common/scoreStorage';
import BackgroundTileSpriteExtended from '../objects/tilesprites/backgroundTileSpriteExtended';

export default class SceneLevel extends Phaser.Scene {
  private readonly city: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageCity.mappingKey,
    screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.35),
    moveSpeed: -0.25,
    depth: 0
  };

  private readonly hill: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageHill.mappingKey,
    screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.65),
    moveSpeed: -0.5,
    depth: 0
  };

  private readonly clouds: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageClouds.mappingKey,
    screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.12),
    moveSpeed: -0.25,
    innerScale: 1.25,
    depth: 10
  };

  private readonly nearForest: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageForest.mappingKey,
    moveSpeed: -1.0,
    innerScale: 1.3,
    depth: 50,
    origin: new Phaser.Math.Vector2(0.5, 1.0)
  };

  private readonly farForest: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageForest.mappingKey,
    screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.72),
    moveSpeed: -1.0,
    innerScale: 0.7,
    origin: new Phaser.Math.Vector2(0.5, 1.0),
    depth: 8
  };

  private readonly farthestForest: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageForest.mappingKey,
    screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.72),
    moveSpeed: -1.0,
    innerScale: 0.5,
    origin: new Phaser.Math.Vector2(0.5, 1.0),
    depth: 7
  };

  private readonly gameOver: {
    image?: Phaser.GameObjects.Image;
    score?: Phaser.GameObjects.BitmapText;
    againButton?: BasicButton;
    menuButton?: BasicButton;
    screenOffsetMult: Phaser.Math.Vector2;
    scale: number;
  } = {
      screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.38),
      scale: 1.15
    };

  private readonly map: {
    object?: Map;

    screenOffsetMult?: Phaser.Math.Vector2;

    startNumChunks: number;

    moveSpeed: number;

    speedUp: {
      func?: any;
      byValue: number;
      eachMillisec: number;
    };

    depth: number;
  } = {
      depth: 9,
      screenOffsetMult: new Phaser.Math.Vector2(0, 1),
      startNumChunks: 8,
      moveSpeed: -1.0,

      speedUp: {
        byValue: 0.1,
        eachMillisec: 100
      }
    };

  private readonly reward: {
    object?: Reward;
    scoreHUD?: ScoreHUDExtended;
    highScoreHUD?: ScoreHUD;

    startNumCoins: number;
    zeroPadding: number;

    prevHighScore: number;

    depth: number;
  } & HUDFrameSettings = {
      fontSize: 38,
      textPadding: 30,
      color: 0x000000,

      startNumCoins: 5,
      zeroPadding: 6,

      prevHighScore: 0,

      depth: this.map.depth
    };

  private readonly traffic: {
    object?: Traffic;

    player?: Vehicle;
    playerStartOffset: Phaser.Math.Vector2;

    depth: number;
  } = {
      playerStartOffset: new Phaser.Math.Vector2(50, 0),

      depth: this.map.depth
    };

  private menuSettings: SettingsModel;

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  private isGameOver: boolean = false;

  constructor() {
    super({ key: 'SceneLevel' });
  }

  private init(data: SettingsModel): void {
    this.menuSettings = data;
  }

  private create(): void {
    // Scene instance is reused across runs; clear stale refs from prior play.
    clearInterval(this.map.speedUp.func);
    this.city.tileSprite = undefined;
    this.hill.tileSprite = undefined;
    this.clouds.tileSprite = undefined;
    this.nearForest.tileSprite = undefined;
    this.farForest.tileSprite = undefined;
    this.farthestForest.tileSprite = undefined;
    this.map.object = undefined;
    this.traffic.object = undefined;
    this.traffic.player = undefined;
    this.reward.object = undefined;
    this.reward.scoreHUD = undefined;
    this.reward.highScoreHUD = undefined;
    this.teardownMobileControls();
    this.gameOver.image = undefined;
    this.gameOver.score = undefined;
    this.gameOver.againButton = undefined;
    this.gameOver.menuButton = undefined;

    this.prepareObjects();
    new MuteButton(this);
    AudioHelper.playBgm(this, sourceModel.soundBgm.mappingKey);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.events.off('onPlayerCollided');
    this.events.on('onPlayerCollided', (id: string) => {
      this.handlePlayerCollided(id);
    });

    this.events.once('shutdown', this.teardownMobileControls, this);
  }

  private prepareObjects(): void {
    this.isGameOver = false;

    this.prepareBackground();
    this.prepareMap();
    this.prepareTraffic();
    this.prepareReward();

    if (this.menuSettings.deviceType === DeviceType.MOBILE) {
      this.setupMobileControls();
    }

    this.traffic.player?.setEnableTurn(true);

    this.map.object?.changeSpeed(this.map.moveSpeed);

    // Start speeding up the map
    this.map.speedUp.func = setInterval(() => {
      this.map.object?.changeSpeed(this.map.object.getSpeed() - this.map.speedUp.byValue);
    }, this.map.speedUp.eachMillisec);
  }

  public update(time: number, delta: number): void {
    if (this.isGameOver) {
      return;
    }

    if (this.cursors?.up?.isDown) {
      this.traffic.player?.turnLeft();
    }
    else if (this.cursors?.down?.isDown) {
      this.traffic.player?.turnRight();
    }

    this.city.tileSprite?.move();
    this.hill.tileSprite?.move();
    this.nearForest.tileSprite?.move();
    this.farForest.tileSprite?.move();
    this.clouds.tileSprite?.move();
    this.farthestForest.tileSprite?.move();
    this.map.object?.move();
    this.reward.object?.move();
    this.reward.object?.addDriveScore(delta);
    this.traffic.object?.move();
  }

  private handlePlayerCollided(id: string): void {
    if (!this.isGameOver) {
      this.isGameOver = true;

      clearInterval(this.map.speedUp.func);

      this.map?.object?.stop(this.map?.speedUp.byValue);

      this.traffic.player?.setEnableTurn(false);

      const earnedPoints = this.reward.object?.getEarnedPoints() ?? 0;
      ScoreStorage.saveHighScore(earnedPoints);
      if (earnedPoints > this.reward.prevHighScore) {
        this.reward.prevHighScore = earnedPoints;
        this.reward.highScoreHUD?.updateScore(earnedPoints);
      }

      AudioHelper.stopBgm(this, sourceModel.soundBgm.mappingKey);

      // Freeze the whole playfield: cars already stopped; coins must stop spinning too.
      this.reward.object?.freeze();

      this.game.events.emit('mobileControlsEnabled', false);

      this.showGameOverOverlay(earnedPoints);
    }
  }

  /** Top/bottom tap rails via overlay — full FOV, lanes map to up/down. */
  private setupMobileControls(): void {
    this.teardownMobileControls();

    this.game.events.off('mobileLaneUp', this.handleMobileLaneUp, this);
    this.game.events.off('mobileLaneDown', this.handleMobileLaneDown, this);
    this.game.events.on('mobileLaneUp', this.handleMobileLaneUp, this);
    this.game.events.on('mobileLaneDown', this.handleMobileLaneDown, this);

    if (this.scene.isActive('MobileControls') || this.scene.isSleeping('MobileControls')) {
      this.scene.wake('MobileControls');
      this.game.events.emit('mobileControlsEnabled', true);
    } else {
      this.scene.launch('MobileControls');
    }
  }

  private teardownMobileControls = (): void => {
    this.game.events.off('mobileLaneUp', this.handleMobileLaneUp, this);
    this.game.events.off('mobileLaneDown', this.handleMobileLaneDown, this);
    this.game.events.emit('mobileControlsEnabled', false);

    if (this.scene.isActive('MobileControls') || this.scene.isSleeping('MobileControls')) {
      this.scene.stop('MobileControls');
    }
  };

  private handleMobileLaneUp = (): void => {
    if (this.isGameOver) {
      return;
    }

    this.traffic.player?.turnLeft();
  };

  private handleMobileLaneDown = (): void => {
    if (this.isGameOver) {
      return;
    }

    this.traffic.player?.turnRight();
  };

  private showGameOverOverlay(earnedPoints: number): void {
    const cx = this.cameras.main.width * this.gameOver.screenOffsetMult.x;
    const cy = this.cameras.main.height * this.gameOver.screenOffsetMult.y;

    this.gameOver.image = this.add.image(cx, cy, sourceModel.imageGameOver.mappingKey)
      .setOrigin(0.5, 0.5)
      .setScale(this.gameOver.scale)
      .setDepth(LayerIDX.GUI + 3)
      .setAlpha(0);

    this.gameOver.score = this.add.bitmapText(
      cx,
      cy + 52,
      sourceModel.font.mappingKey,
      `SCORE ${Common.fillZeroPadding(earnedPoints, 6)}`,
      42
    )
      .setOrigin(0.5, 0)
      .setDepth(LayerIDX.GUI + 3)
      .setAlpha(0);

    // Matching pixel buttons: AGAIN (retry) + MENU (car select).
    // Same hover language as START: yellow→red frame + slight scale-up.
    const btnScale = 0.33;
    const btnHoverScale = btnScale * 1.035; // subtle grow (shared with START)
    const btnY = cy + 145;
    const btnGap = 210;

    this.gameOver.againButton = new BasicButton(
      this,
      new Phaser.Math.Vector2(cx - btnGap / 2, btnY),
      sourceModel.spriteAgain.mappingKey,
      LayerIDX.GUI + 3,
      btnScale,
      undefined,
      sourceModel.soundButton.mappingKey
    );
    this.prepareGameOverButton(this.gameOver.againButton, btnScale);

    this.gameOver.menuButton = new BasicButton(
      this,
      new Phaser.Math.Vector2(cx + btnGap / 2, btnY),
      sourceModel.spriteMenu.mappingKey,
      LayerIDX.GUI + 3,
      btnScale,
      undefined,
      sourceModel.soundButton.mappingKey
    );
    this.prepareGameOverButton(this.gameOver.menuButton, btnScale);

    this.tweens.add({
      targets: [
        this.gameOver.image,
        this.gameOver.score,
        this.gameOver.againButton,
        this.gameOver.menuButton
      ],
      alpha: 1,
      duration: 220,
      ease: 'Quad.easeOut'
    });

    this.time.delayedCall(280, () => {
      this.wireGameOverButton(this.gameOver.againButton, btnScale, btnHoverScale, this.handleGameOverAgain);
      this.wireGameOverButton(this.gameOver.menuButton, btnScale, btnHoverScale, this.handleGameOverMenu);
    });
  }

  /** Origin + fixed hitbox so frame swaps cannot shift or reflow the button. */
  private prepareGameOverButton(button: BasicButton, btnScale: number): void {
    button.setOrigin(0.5, 0.5);
    button.setAlpha(0);
    button.setFrame(0, false, false);
    button.setOrigin(0.5, 0.5);
    // Fixed hit area in local texture space — ignores per-frame content width
    button.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, button.width, button.height),
      Phaser.Geom.Rectangle.Contains
    );
    button.setScale(btnScale);
  }

  private wireGameOverButton(
    button: BasicButton | undefined,
    idleScale: number,
    hoverScale: number,
    handler: () => void
  ): void {
    if (!button) {
      return;
    }

    // Same as START: yellow idle → red hover + scale-up from center.
    button.on('pointerdown', handler, this);
    button.on('pointerover', () => {
      button.setFrame(1, false, false);
      button.setOrigin(0.5, 0.5);
      button.setScale(hoverScale);
      button.playSound();
    });
    button.on('pointerout', () => {
      button.setFrame(0, false, false);
      button.setOrigin(0.5, 0.5);
      button.setScale(idleScale);
    });
  }

  private handleGameOverAgain(): void {
    this.scene.start('PreloadLevel', this.menuSettings);
  }

  private handleGameOverMenu(): void {
    this.scene.start('SceneMenu');
  }

  //#region Prepares

  private prepareReward(): void {
    const highScore = ScoreStorage.getHighScore();
    this.reward.prevHighScore = highScore;

    if (this.reward.object) {
      this.reward.object.generateReward(this.reward.startNumCoins);

      if (this.traffic.player) {
        this.reward.object.attachPlayer(this.traffic.player);
      }

      this.reward.highScoreHUD?.updateScore(highScore);
      return;
    }

    if (this.map.object && this.traffic.player) {
      this.reward.object = new Reward(
        this,
        this.map.object,
        this.traffic.player,
        this.reward.depth,
        this.reward.startNumCoins
      );
    }

    this.reward.scoreHUD = new ScoreHUDExtended(
      this,
      'SCORE',
      AppendFrom.LEFT,
      this.reward.color,
      this.reward.fontSize,
      this.reward.textPadding,
      this.reward.zeroPadding
    );

    this.reward.highScoreHUD = new ScoreHUD(
      this,
      'HIGHEST SCORE',
      AppendFrom.RIGHT,
      this.reward.color,
      this.reward.fontSize,
      this.reward.textPadding,
      this.reward.zeroPadding
    );

    this.reward.highScoreHUD.updateScore(highScore);
  }

  private prepareTraffic(): void {
    if (this.traffic.object) {
      this.traffic.object.generateTraffic();

      this.traffic.player = this.traffic.object.generateVehicle(
        this.menuSettings.vehicle,
        0,
        this.traffic.playerStartOffset,
        [],
        false
      );

      this.traffic.object.attachPlayer(this.traffic.player);

      return;
    }

    if (this.map.object) {
      this.traffic.object = new Traffic(
        this,
        this.map.object,
        this.traffic.depth
      );

      this.traffic.object?.generateTraffic();

      this.traffic.player = this.traffic.object.generateVehicle(
        this.menuSettings.vehicle,
        0,
        this.traffic.playerStartOffset,
        [],
        false
      );

      this.traffic.object.attachPlayer(this.traffic.player);
    }
  }

  private prepareMap(): void {
    if (this.map.object) {
      this.map.object.generateMap(this.map.startNumChunks);

      return;
    }

    this.map.object = new Map(
      this,
      this.map.depth,
      new Phaser.Math.Vector2(
        this.cameras.main.width * (this.map.screenOffsetMult?.x ?? 1),
        this.cameras.main.height * (this.map.screenOffsetMult?.y ?? 1)
      ),
      this.map.startNumChunks
    );
  }

  private prepareBackground(): void {
    if (!this.city.tileSprite) {
      this.city.tileSprite =
        new BackgroundTileSpriteExtended(
          this,
          this.city.mappingKey,
          this.city.moveSpeed,
          this.city.outerScale,
          this.city.innerScale,
          this.city.depth,
          this.city.origin,
          this.city.screenOffsetMult
        );
    }

    if (!this.hill.tileSprite) {
      this.hill.tileSprite =
        new BackgroundTileSpriteExtended(
          this,
          this.hill.mappingKey,
          this.hill.moveSpeed,
          this.hill.outerScale,
          this.hill.innerScale,
          this.hill.depth,
          this.hill.origin,
          this.hill.screenOffsetMult
        );
    }

    if (!this.clouds.tileSprite) {
      this.clouds.tileSprite =
        new BackgroundTileSpriteExtended(
          this,
          this.clouds.mappingKey,
          this.clouds.moveSpeed,
          this.clouds.outerScale,
          this.clouds.innerScale,
          this.clouds.depth,
          this.clouds.origin,
          this.clouds.screenOffsetMult
        );
    }

    if (!this.nearForest.tileSprite) {
      this.nearForest.tileSprite =
        new BackgroundTileSpriteExtended(
          this,
          this.nearForest.mappingKey,
          this.nearForest.moveSpeed,
          this.nearForest.outerScale,
          this.nearForest.innerScale,
          this.nearForest.depth,
          this.nearForest.origin,
          this.nearForest.screenOffsetMult
        );
    }

    if (!this.farForest.tileSprite) {
      this.farForest.tileSprite =
        new BackgroundTileSpriteExtended(
          this,
          this.farForest.mappingKey,
          this.farForest.moveSpeed,
          this.farForest.outerScale,
          this.farForest.innerScale,
          this.farForest.depth,
          this.farForest.origin,
          this.farForest.screenOffsetMult
        );
    }

    if (!this.farthestForest.tileSprite) {
      this.farthestForest.tileSprite =
        new BackgroundTileSpriteExtended(
          this,
          this.farthestForest.mappingKey,
          this.farthestForest.moveSpeed,
          this.farthestForest.outerScale,
          this.farthestForest.innerScale,
          this.farthestForest.depth,
          this.farthestForest.origin,
          this.farthestForest.screenOffsetMult
        );
    }
  }
  //#endregion
}
