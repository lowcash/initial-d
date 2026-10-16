import { sourceModel } from '../models/source'
import Common, { Direction, LayerIDX } from '../objects/_common/common'
import { ControlState, DeviceType, SettingsModel } from '../models/settings'

import BasicButton, { BasicButtonMapping } from '../objects/buttons/basicButton';
import MuteButton from '../objects/buttons/muteButton';
import { BackgroundTileSpriteMapping } from '../objects/tilesprites/backgroundTileSprite'
import HUD, { HUDFrameSettings } from '../objects/HUD';
import ScoreStorage from '../objects/_common/scoreStorage';

import Map from '../objects/map/map'
import Traffic from '../objects/traffic/traffic'
import { VehicleType } from '../objects/traffic/vehicle'
import BackgroundTileSpriteExtended from '../objects/tilesprites/backgroundTileSpriteExtended';

export default class SceneMenu extends Phaser.Scene {
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

  /** Title banner → vehicle grid → Start (tight under the grid). */
  private readonly layout = {
    heroY: 0.22,
    vehiclesY: 0.37,
    titleScale: 0.72,
    startScale: 1.15,
    startActionScale: 1.15 * 1.035, // same subtle grow as AGAIN / MENU
    startGapBelowPanel: 22,
  };

  private readonly start: BasicButtonMapping = {
    mappingKey: sourceModel.spriteStart.mappingKey,
    standartScale: this.layout.startScale,
    actionScale: this.layout.startActionScale,
    depth: LayerIDX.GUI,
  };

  private logo?: Phaser.GameObjects.Image;
  private vehiclesPanelBottom: number = 0;

  private readonly vehicles: {
    mapping: { [id: string]: Phaser.GameObjects.Image; };

    standartScale: number;
    actionScale: number;

    selectedVehicle: VehicleType;

    /** Local grid cell size (atlas frame ≈ 124×65). */
    cellSize: Phaser.Math.Vector2;
    columns: number;

    depth?: number;

    group?: Phaser.GameObjects.Group;
  } & HUDFrameSettings = {
      mapping: {},

      standartScale: 1.1,
      actionScale: 1.35,

      cellSize: new Phaser.Math.Vector2(140, 80),
      columns: 5,

      text: 'Select vehicle',
      textPadding: 14,
      fontSize: 38,
      color: 0x333333,
      alpha: 0.65,

      depth: LayerIDX.GUI,

      selectedVehicle: VehicleType.AE_86_TRUENO
    };

  private readonly map: {
    object?: Map;

    screenOffsetMult?: Phaser.Math.Vector2;

    startNumChunks: number;

    moveSpeed: number;

    depth: number;
  } = {
      depth: 9,
      screenOffsetMult: new Phaser.Math.Vector2(0, 1),
      startNumChunks: 8,
      moveSpeed: -1.0
    };

  private readonly traffic: {
    object?: Traffic;

    playerStartOffset: Phaser.Math.Vector2;

    depth: number;
  } = {
      playerStartOffset: new Phaser.Math.Vector2(50, 0),

      depth: this.map.depth
    };

  constructor() {
    super({ key: 'SceneMenu' })
  }

  private create(): void {
    // Scene instance is reused when returning from a crash; clear stale refs.
    this.city.tileSprite = undefined;
    this.hill.tileSprite = undefined;
    this.clouds.tileSprite = undefined;
    this.nearForest.tileSprite = undefined;
    this.farForest.tileSprite = undefined;
    this.farthestForest.tileSprite = undefined;
    this.map.object = undefined;
    this.traffic.object = undefined;
    this.start.button = undefined;
    this.logo = undefined;
    this.vehicles.group = undefined;
    this.vehicles.mapping = {};

    this.prepareMap();
    this.prepareBackground();
    this.prepareHero();
    this.prepareHighScore();
    this.prepareVehicles();
    this.prepareStart();
    this.prepareTraffic();
    new MuteButton(this);

    this.map.object!.changeSpeed(this.map.moveSpeed);

    // Prefetch heavy level assets while the player picks a car (avoids black freeze on START).
    this.prefetchLevelAssets();
  }

  /** Warm the cache for BGM + game-over UI so PreloadLevel is nearly instant. */
  private prefetchLevelAssets(): void {
    let queued = false;

    if (!this.cache.audio.exists(sourceModel.soundBgm.mappingKey)) {
      this.load.audio(sourceModel.soundBgm.mappingKey, sourceModel.soundBgm.sourcePath);
      queued = true;
    }
    if (!this.cache.audio.exists(sourceModel.soundExplosion.mappingKey)) {
      this.load.audio(sourceModel.soundExplosion.mappingKey, sourceModel.soundExplosion.sourcePath);
      queued = true;
    }
    if (!this.cache.audio.exists(sourceModel.soundCoin.mappingKey)) {
      this.load.audio(sourceModel.soundCoin.mappingKey, sourceModel.soundCoin.sourcePath);
      queued = true;
    }
    if (!this.textures.exists(sourceModel.spriteCoin.mappingKey)) {
      this.load.spritesheet(sourceModel.spriteCoin.mappingKey, sourceModel.spriteCoin.sourcePath, {
        frameWidth: 32,
        frameHeight: 32
      });
      queued = true;
    }
    if (!this.textures.exists(sourceModel.spriteAgain.mappingKey)) {
      this.load.spritesheet(sourceModel.spriteAgain.mappingKey, sourceModel.spriteAgain.sourcePath, {
        frameWidth: 608,
        frameHeight: 228
      });
      queued = true;
    }
    if (!this.textures.exists(sourceModel.spriteMenu.mappingKey)) {
      this.load.spritesheet(sourceModel.spriteMenu.mappingKey, sourceModel.spriteMenu.sourcePath, {
        frameWidth: 602,
        frameHeight: 228
      });
      queued = true;
    }
    if (!this.textures.exists(sourceModel.spriteArrowsPlay.mappingKey)) {
      this.load.spritesheet(sourceModel.spriteArrowsPlay.mappingKey, sourceModel.spriteArrowsPlay.sourcePath, {
        frameWidth: 84,
        frameHeight: 76
      });
      queued = true;
    }
    if (!this.textures.exists(sourceModel.imageGameOver.mappingKey)) {
      this.load.image(sourceModel.imageGameOver.mappingKey, sourceModel.imageGameOver.sourcePath);
      queued = true;
    }

    if (queued) {
      this.load.start();
    }
  }

  public update(): void {
    this.city.tileSprite?.move();
    this.hill.tileSprite?.move();
    this.clouds.tileSprite?.move();
    this.nearForest.tileSprite?.move();
    this.farForest.tileSprite?.move();
    this.farthestForest.tileSprite?.move();

    this.map.object?.move();
  }

  //#region Prepares
  private prepareTraffic(): void {
    if (this.map.object) {
      this.traffic.object = new Traffic(
        this,
        this.map.object,
        this.traffic.depth
      );

      this.selectVehicle(this.vehicles.selectedVehicle, `${this.vehicles.selectedVehicle}/${Direction.RIGHT}`);
    }
  }

  private prepareMap(): void {
    this.map.object = new Map(
      this,
      this.map.depth,
      new Phaser.Math.Vector2(
        this.cameras.main.width * this.map.screenOffsetMult!.x ?? 1,
        this.cameras.main.height * this.map.screenOffsetMult!.y ?? 1
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

  private prepareHero(): void {
    this.logo = this.add.image(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * this.layout.heroY,
      sourceModel.imageLogo.mappingKey
    )
      .setOrigin(0.5, 0.5)
      .setScale(this.layout.titleScale)
      .setDepth(LayerIDX.GUI);

    if (this.textures.exists(sourceModel.imageLogo.mappingKey)) {
      this.textures.get(sourceModel.imageLogo.mappingKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
  }

  private prepareHighScore(): void {
    const highScore = ScoreStorage.getHighScore();
    const label = this.add.bitmapText(
      this.cameras.main.width - 24,
      18,
      sourceModel.font.mappingKey,
      `HIGHEST SCORE ${Common.fillZeroPadding(highScore, 6)}`,
      36
    )
      .setOrigin(1, 0)
      .setDepth(LayerIDX.GUI + 1);
  }

  private prepareStart(): void {
    const startY = this.vehiclesPanelBottom + this.layout.startGapBelowPanel
      + (69 * this.layout.startScale) / 2;

    this.start.button = new BasicButton(
      this,
      new Phaser.Math.Vector2(this.cameras.main.width * 0.5, startY),
      sourceModel.spriteStart.mappingKey,
      this.start.depth,
      this.layout.startScale,
      undefined,
      sourceModel.soundButton.mappingKey
    );

    this.start.button?.on('pointerover', this.handleHoverStartButton, this);
    this.start.button?.on('pointerout', this.handleEndHoverStartButton, this);
    this.start.button?.on('pointerdown', this.handlePressedStartButton, this);
  }

  private prepareVehicles(): void {
    const padding = this.vehicles.textPadding ?? 16;
    const columns = this.vehicles.columns;
    const rows = Math.ceil(10 / columns);
    const gridWidth = columns * this.vehicles.cellSize.x * this.vehicles.standartScale;
    const gridHeight = rows * this.vehicles.cellSize.y * this.vehicles.standartScale;

    const vehiclesText = this.add.bitmapText(
      0,
      0,
      sourceModel.font.mappingKey,
      this.vehicles.text,
      this.vehicles.fontSize
    );
    vehiclesText.setDepth(LayerIDX.GUI + 1);
    vehiclesText.setOrigin(0.5, 0);

    const panelWidth = Math.max(vehiclesText.width, gridWidth) + 2 * padding;
    const panelHeight = padding + vehiclesText.height + padding + gridHeight + padding;

    const panelX = (this.cameras.main.width - panelWidth) / 2;
    const panelY = this.cameras.main.height * this.layout.vehiclesY;
    this.vehiclesPanelBottom = panelY + panelHeight;

    const hud = new HUD(
      this,
      new Phaser.Geom.Rectangle(
        0,
        0,
        panelWidth,
        panelHeight
      ),
      this.vehicles.color,
      this.vehicles.alpha
    );
    hud.setPosition(panelX, panelY);
    hud.setDepth(LayerIDX.GUI);

    vehiclesText.setPosition(panelX + panelWidth / 2, panelY + padding);

    this.vehicles.group = this.add.group();
    this.vehicles.group?.add(hud);
    this.vehicles.group?.add(vehiclesText);

    const gridOrigin = new Phaser.Math.Vector2(
      panelX + (panelWidth - gridWidth) / 2,
      panelY + padding + vehiclesText.height + padding
    );

    const vehicleOrder: VehicleType[] = [
      VehicleType.AE_86_TRUENO,
      VehicleType.AE_86_LEVIN,
      VehicleType.RX_7_FC,
      VehicleType.RX_7_FD,
      VehicleType.S_13,
      VehicleType.CIVIC,
      VehicleType._180_SX,
      VehicleType.EVO_3,
      VehicleType.R_32,
      VehicleType.EVO_4,
    ];

    vehicleOrder.forEach((vehicle, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      this.addVehicleToGroupAsGrid(
        vehicle,
        Direction.RIGHT,
        new Phaser.Math.Vector2(col, row),
        gridOrigin
      );
    });

    const selectedKey = `${this.vehicles.selectedVehicle}/${Direction.RIGHT}`;
    if (this.vehicles.mapping[selectedKey]) {
      this.rescaleVehicleSelection(this.vehicles.selectedVehicle, selectedKey);
    }
  }
  //#endregion

  private addVehicleToGroupAsGrid(vehicle: VehicleType, direction: Direction, gridPos: Phaser.Math.Vector2, offset: Phaser.Math.Vector2): void {
    const mappingKey = `${vehicle.toString()}/${direction.toString()}`;

    this.vehicles.mapping[mappingKey] = this.add.image(
      offset.x + (this.vehicles.cellSize.x * gridPos.x) * this.vehicles.standartScale,
      offset.y + (this.vehicles.cellSize.y * gridPos.y) * this.vehicles.standartScale,
      sourceModel.atlasVehicle.mappingKey,
      mappingKey
    )
      .setOrigin(0, 0)
      .setScale(this.vehicles.standartScale)
      .setInteractive()
      .setDepth(this.vehicles.depth ?? 0)
      .on('pointerdown', () => { this.handleClickVehicle(vehicle, mappingKey) });

    this.vehicles.group?.add(this.vehicles.mapping[mappingKey]);
  }

  private selectVehicle(vehicle: VehicleType, mappingKey: string): void {
    this.rescaleVehicleSelection(vehicle, mappingKey);

    this.sound.play(sourceModel.soundButton.mappingKey);

    this.vehicles.selectedVehicle = vehicle;

    this.traffic.object?.clearTraffic();

    this.traffic.object?.generateVehicle(
      this.vehicles.selectedVehicle,
      0,
      this.traffic.playerStartOffset,
      [],
      false
    );
  }

  private rescaleVehicleSelection(vehicle: VehicleType, mappingKey: string) {
    for (const v of Object.values(this.vehicles.mapping)) {
      v.setScale(this.vehicles.standartScale);
      v.setDepth(this.vehicles.depth ?? 1);
    }

    this.vehicles.mapping[mappingKey].setScale(this.vehicles.actionScale);
    this.vehicles.mapping[mappingKey].setDepth((this.vehicles.depth ?? 1) + 1);
  }

  //#region Handlers
  private handleClickVehicle(vehicle: VehicleType, mappingKey: string): void {
    this.selectVehicle(vehicle, mappingKey);
  }

  private handleHoverStartButton(context: any) {
    this.start.button?.setFrame(ControlState.PENDING);

    this.start.button?.setScale(this.start.actionScale ?? 1);

    this.start.button?.playSound();
  }

  private handleEndHoverStartButton(context: any) {
    this.start.button?.setFrame(ControlState.NOT_SELECTED);

    this.start.button?.setScale(this.start.standartScale ?? 1);
  }

  private handlePressedStartButton(context: any) {
    this.start.button?.off('pointerover');
    this.start.button?.off('pointerout');
    this.start.button?.off('pointerdown');

    this.scene.start('PreloadLevel', new SettingsModel(
      this.sys.game.device.os.desktop ? DeviceType.DESKTOP : DeviceType.MOBILE,
      this.vehicles.selectedVehicle
    ));
  }
}
//#endregion
