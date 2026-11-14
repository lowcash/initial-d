import { sourceModel } from '../models/source'
import Common, { Direction, LayerIDX } from '../objects/_common/common'
import { ControlState, DeviceType, SettingsModel } from '../models/settings'
import { MenuRunState } from '../models/runState'
import { SPEED_START } from '../models/tuning'

import BasicButton from '../objects/buttons/basicButton'
import MuteButton from '../objects/buttons/muteButton'
import HUD from '../objects/HUD'
import ScoreStorage from '../objects/_common/scoreStorage'
import AudioHelper from '../objects/_common/audioHelper'
import { prefetchLevelAssets } from '../objects/_common/assetLoader'
import { isTouchPreferred } from '../objects/_common/touch'
import {
  createBackgroundLayers,
  MAP_DEFAULTS,
  moveBackgroundLayers,
  prepareMap,
  prepareTraffic,
  TRAFFIC_DEFAULTS,
} from '../objects/background/backgroundLayers'

import { VehicleType } from '../objects/traffic/vehicle'

export default class SceneMenu extends Phaser.Scene {
  private readonly layout = {
    heroY: 0.22,
    vehiclesY: 0.37,
    titleScale: 0.72,
    startScale: 1.15,
    startActionScale: 1.15 * 1.035,
    startGapBelowPanel: 22,
  }

  private readonly vehiclesUi = {
    standartScale: 1.1,
    actionScale: 1.35,
    selectedVehicle: VehicleType.AE_86_TRUENO,
    cellSize: new Phaser.Math.Vector2(140, 80),
    columns: 5,
    text: 'Select vehicle',
    textPadding: 14,
    fontSize: 38,
    color: 0x333333,
    alpha: 0.65,
    depth: LayerIDX.GUI,
  }

  private run!: MenuRunState

  constructor() {
    super({ key: 'SceneMenu' })
  }

  private create(): void {
    this.run = new MenuRunState()

    Common.clearGameEvents(this)
    this.events.once('shutdown', () => Common.clearGameEvents(this))

    this.prepareMap()
    createBackgroundLayers(this, this.run.backgrounds)
    this.prepareHero()
    this.prepareHighScore()
    this.prepareVehicles()
    this.prepareStart()
    this.prepareTraffic()
    new MuteButton(this)

    this.run.map!.changeSpeed(SPEED_START)

    this.input.keyboard?.on('keydown-ENTER', this.handleStartKeyboard, this)
    this.input.keyboard?.on('keydown-SPACE', this.handleStartKeyboard, this)
    this.events.once('shutdown', () => {
      this.input.keyboard?.off('keydown-ENTER', this.handleStartKeyboard, this)
      this.input.keyboard?.off('keydown-SPACE', this.handleStartKeyboard, this)
    })

    prefetchLevelAssets(this)
  }

  public update(_time: number, delta: number): void {
    const dt = Common.getFrameScale(delta)
    moveBackgroundLayers(this.run.backgrounds, dt)
    this.run.map?.move(dt)
  }

  private prepareTraffic(): void {
    if (!this.run.map) return
    this.run.traffic = prepareTraffic(this, this.run.map, TRAFFIC_DEFAULTS.depth, this.run.traffic)
    this.selectVehicle(this.vehiclesUi.selectedVehicle, `${this.vehiclesUi.selectedVehicle}/${Direction.RIGHT}`)
  }

  private prepareMap(): void {
    this.run.map = prepareMap(
      this,
      this.run.map,
      MAP_DEFAULTS.depth,
      MAP_DEFAULTS.screenOffsetMult,
      MAP_DEFAULTS.startNumChunks,
    )
  }

  private prepareHero(): void {
    this.run.logo = this.add
      .image(
        this.cameras.main.width * 0.5,
        this.cameras.main.height * this.layout.heroY,
        sourceModel.imageLogo.mappingKey,
      )
      .setOrigin(0.5, 0.5)
      .setScale(this.layout.titleScale)
      .setDepth(LayerIDX.GUI)

    if (this.textures.exists(sourceModel.imageLogo.mappingKey)) {
      this.textures.get(sourceModel.imageLogo.mappingKey).setFilter(Phaser.Textures.FilterMode.NEAREST)
    }
  }

  private prepareHighScore(): void {
    const highScore = ScoreStorage.getHighScore()
    this.add
      .bitmapText(
        this.cameras.main.width - 24,
        18,
        sourceModel.font.mappingKey,
        `HIGHEST SCORE ${Common.fillZeroPadding(highScore, 6)}`,
        36,
      )
      .setOrigin(1, 0)
      .setDepth(LayerIDX.GUI + 1)
  }

  private prepareStart(): void {
    const frameH = sourceModel.spriteStart.frameHeight ?? 69
    const startY = this.run.vehiclesPanelBottom + this.layout.startGapBelowPanel + (frameH * this.layout.startScale) / 2

    this.run.startButton = new BasicButton(
      this,
      new Phaser.Math.Vector2(this.cameras.main.width * 0.5, startY),
      sourceModel.spriteStart.mappingKey,
      LayerIDX.GUI,
      this.layout.startScale,
      undefined,
      sourceModel.soundButton.mappingKey,
    )

    this.run.startButton.on('pointerover', this.handleHoverStartButton, this)
    this.run.startButton.on('pointerout', this.handleEndHoverStartButton, this)
    this.run.startButton.on('pointerdown', this.handlePressedStartButton, this)
  }

  private prepareVehicles(): void {
    const padding = this.vehiclesUi.textPadding
    const columns = this.vehiclesUi.columns
    const rows = Math.ceil(10 / columns)
    const gridWidth = columns * this.vehiclesUi.cellSize.x * this.vehiclesUi.standartScale
    const gridHeight = rows * this.vehiclesUi.cellSize.y * this.vehiclesUi.standartScale

    const vehiclesText = this.add.bitmapText(
      0,
      0,
      sourceModel.font.mappingKey,
      this.vehiclesUi.text,
      this.vehiclesUi.fontSize,
    )
    vehiclesText.setDepth(LayerIDX.GUI + 1)
    vehiclesText.setOrigin(0.5, 0)

    const panelWidth = Math.max(vehiclesText.width, gridWidth) + 2 * padding
    const panelHeight = padding + vehiclesText.height + padding + gridHeight + padding

    const panelX = (this.cameras.main.width - panelWidth) / 2
    const panelY = this.cameras.main.height * this.layout.vehiclesY
    this.run.vehiclesPanelBottom = panelY + panelHeight

    const hud = new HUD(
      this,
      new Phaser.Geom.Rectangle(0, 0, panelWidth, panelHeight),
      this.vehiclesUi.color,
      this.vehiclesUi.alpha,
    )
    hud.setPosition(panelX, panelY)
    hud.setDepth(LayerIDX.GUI)

    vehiclesText.setPosition(panelX + panelWidth / 2, panelY + padding)

    this.run.vehiclesGroup = this.add.group()
    this.run.vehiclesGroup.add(hud)
    this.run.vehiclesGroup.add(vehiclesText)

    const gridOrigin = new Phaser.Math.Vector2(
      panelX + (panelWidth - gridWidth) / 2,
      panelY + padding + vehiclesText.height + padding,
    )

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
    ]

    vehicleOrder.forEach((vehicle, index) => {
      const col = index % columns
      const row = Math.floor(index / columns)
      this.addVehicleToGroupAsGrid(vehicle, Direction.RIGHT, new Phaser.Math.Vector2(col, row), gridOrigin)
    })

    const selectedKey = `${this.vehiclesUi.selectedVehicle}/${Direction.RIGHT}`
    if (this.run.vehiclesMapping[selectedKey]) {
      this.rescaleVehicleSelection(selectedKey)
    }
  }

  private addVehicleToGroupAsGrid(
    vehicle: VehicleType,
    direction: Direction,
    gridPos: Phaser.Math.Vector2,
    offset: Phaser.Math.Vector2,
  ): void {
    const mappingKey = `${vehicle.toString()}/${direction.toString()}`

    this.run.vehiclesMapping[mappingKey] = this.add
      .image(
        offset.x + this.vehiclesUi.cellSize.x * gridPos.x * this.vehiclesUi.standartScale,
        offset.y + this.vehiclesUi.cellSize.y * gridPos.y * this.vehiclesUi.standartScale,
        sourceModel.atlasVehicle.mappingKey,
        mappingKey,
      )
      .setOrigin(0, 0)
      .setScale(this.vehiclesUi.standartScale)
      .setInteractive()
      .setDepth(this.vehiclesUi.depth)
      .on('pointerdown', () => {
        this.handleClickVehicle(vehicle, mappingKey)
      })

    this.run.vehiclesGroup?.add(this.run.vehiclesMapping[mappingKey])
  }

  private selectVehicle(vehicle: VehicleType, mappingKey: string): void {
    this.rescaleVehicleSelection(mappingKey)
    AudioHelper.playSfx(this, sourceModel.soundButton.mappingKey)
    this.vehiclesUi.selectedVehicle = vehicle

    this.run.traffic?.clearTraffic()
    this.run.traffic?.generateVehicle(this.vehiclesUi.selectedVehicle, 0, TRAFFIC_DEFAULTS.playerStartOffset, [], false)
  }

  private rescaleVehicleSelection(mappingKey: string) {
    for (const v of Object.values(this.run.vehiclesMapping)) {
      v.setScale(this.vehiclesUi.standartScale)
      v.setDepth(this.vehiclesUi.depth)
    }

    this.run.vehiclesMapping[mappingKey].setScale(this.vehiclesUi.actionScale)
    this.run.vehiclesMapping[mappingKey].setDepth(this.vehiclesUi.depth + 1)
  }

  private handleClickVehicle(vehicle: VehicleType, mappingKey: string): void {
    this.selectVehicle(vehicle, mappingKey)
  }

  private handleHoverStartButton() {
    this.run.startButton?.setFrame(ControlState.PENDING)
    this.run.startButton?.setScale(this.layout.startActionScale)
    this.run.startButton?.playSound()
  }

  private handleEndHoverStartButton() {
    this.run.startButton?.setFrame(ControlState.NOT_SELECTED)
    this.run.startButton?.setScale(this.layout.startScale)
  }

  private handleStartKeyboard = (): void => {
    this.handlePressedStartButton()
  }

  private handlePressedStartButton() {
    this.run.startButton?.off('pointerover')
    this.run.startButton?.off('pointerout')
    this.run.startButton?.off('pointerdown')

    const device = isTouchPreferred() ? DeviceType.MOBILE : DeviceType.DESKTOP
    this.scene.start('PreloadLevel', new SettingsModel(device, this.vehiclesUi.selectedVehicle))
  }
}
