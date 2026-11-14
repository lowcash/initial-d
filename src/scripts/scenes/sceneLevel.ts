import { sourceModel } from '../models/source'
import { DeviceType, SettingsModel } from '../models/settings'
import { LevelRunState } from '../models/runState'
import { nextSpeed, SPEED_RAMP_INTERVAL_MS, SPEED_RAMP_PER_TICK, SPEED_START } from '../models/tuning'

import BasicButton from '../objects/buttons/basicButton'
import MuteButton from '../objects/buttons/muteButton'
import Reward from '../objects/reward/reward'
import ScoreHUD, { AppendFrom, ScoreHUDExtended } from '../objects/reward/hud'
import Common, { LayerIDX, GameEvent } from '../objects/_common/common'
import AudioHelper from '../objects/_common/audioHelper'
import ScoreStorage from '../objects/_common/scoreStorage'
import {
  createBackgroundLayers,
  MAP_DEFAULTS,
  moveBackgroundLayers,
  prepareMap,
  prepareTraffic,
  TRAFFIC_DEFAULTS,
} from '../objects/background/backgroundLayers'

export default class SceneLevel extends Phaser.Scene {
  private readonly gameOverLayout = {
    screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.38),
    scale: 1.15,
  }

  private readonly rewardDefaults = {
    fontSize: 38,
    textPadding: 30,
    color: 0x000000,
    startNumCoins: 5,
    zeroPadding: 6,
    depth: MAP_DEFAULTS.depth,
  }

  private menuSettings: SettingsModel
  private run!: LevelRunState
  private onVisibilityChange?: () => void

  constructor() {
    super({ key: 'SceneLevel' })
  }

  private init(data: SettingsModel): void {
    this.menuSettings = data
  }

  private create(): void {
    this.run = new LevelRunState()
    Common.clearGameEvents(this)
    this.teardownMobileControls()

    this.prepareObjects()
    new MuteButton(this)
    AudioHelper.playBgm(this, sourceModel.soundBgm.mappingKey)

    this.run.cursors = this.input.keyboard?.createCursorKeys()
    if (this.input.keyboard) {
      this.run.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      }
    }

    this.input.keyboard?.on('keydown-ESC', this.handlePauseKey, this)
    this.input.keyboard?.on('keydown-P', this.handlePauseKey, this)

    this.onVisibilityChange = () => {
      if (document.hidden) {
        this.pauseGame()
      }
    }
    document.addEventListener('visibilitychange', this.onVisibilityChange)

    this.events.on(GameEvent.PLAYER_COLLIDED, (id: string) => {
      this.handlePlayerCollided(id)
    })

    this.events.once('shutdown', this.handleShutdown, this)
  }

  private prepareObjects(): void {
    this.run.isGameOver = false
    this.run.isPaused = false

    createBackgroundLayers(this, this.run.backgrounds)
    this.run.map = prepareMap(
      this,
      this.run.map,
      MAP_DEFAULTS.depth,
      MAP_DEFAULTS.screenOffsetMult,
      MAP_DEFAULTS.startNumChunks,
    )
    this.prepareTraffic()
    this.prepareReward()

    if (this.menuSettings.deviceType === DeviceType.MOBILE) {
      this.setupMobileControls()
    }

    this.run.player?.setEnableTurn(true)
    this.run.map?.changeSpeed(SPEED_START)

    this.run.speedUpTimer = this.time.addEvent({
      delay: SPEED_RAMP_INTERVAL_MS,
      loop: true,
      callback: () => {
        if (!this.run.map || this.run.isPaused || this.run.isGameOver) return
        this.run.map.changeSpeed(nextSpeed(this.run.map.getSpeed(), SPEED_RAMP_PER_TICK))
      },
    })
  }

  public update(_time: number, delta: number): void {
    if (this.run.isGameOver || this.run.isPaused) {
      return
    }

    const up =
      this.run.cursors?.up?.isDown ||
      this.run.cursors?.left?.isDown ||
      this.run.wasd?.W.isDown ||
      this.run.wasd?.A.isDown
    const down =
      this.run.cursors?.down?.isDown ||
      this.run.cursors?.right?.isDown ||
      this.run.wasd?.S.isDown ||
      this.run.wasd?.D.isDown

    if (up) {
      this.run.player?.turnLeft()
    } else if (down) {
      this.run.player?.turnRight()
    }

    const dt = Common.getFrameScale(delta)

    moveBackgroundLayers(this.run.backgrounds, dt)
    this.run.map?.move(dt)
    this.run.reward?.move(dt)
    this.run.reward?.addDriveScore(Common.getFrameScale(delta) * (1000 / 60))
    this.run.traffic?.move(dt)
  }

  private handlePauseKey = (): void => {
    if (this.run.isGameOver) return
    if (this.run.isPaused) {
      this.resumeGame()
    } else {
      this.pauseGame()
    }
  }

  private pauseGame(): void {
    if (this.run.isPaused || this.run.isGameOver) return
    this.run.isPaused = true
    this.physics.pause()
    this.tweens.pauseAll()
    this.time.paused = true

    const cx = this.cameras.main.width / 2
    const cy = this.cameras.main.height / 2
    const bg = this.add.rectangle(cx, cy, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.55)
    const text = this.add
      .bitmapText(cx, cy, sourceModel.font.mappingKey, 'PAUSED\nESC / P TO RESUME', 42)
      .setOrigin(0.5)
      .setCenterAlign()
    this.run.pauseOverlay = this.add.container(0, 0, [bg, text]).setDepth(LayerIDX.GUI + 20)
  }

  private resumeGame(): void {
    if (!this.run.isPaused) return
    this.run.isPaused = false
    this.physics.resume()
    this.tweens.resumeAll()
    this.time.paused = false
    this.run.pauseOverlay?.destroy(true)
    this.run.pauseOverlay = undefined
  }

  private handlePlayerCollided(_id: string): void {
    if (this.run.isGameOver) return
    this.run.isGameOver = true
    this.resumeGame()

    this.run.speedUpTimer?.remove(false)
    this.run.map?.stop(SPEED_RAMP_PER_TICK)
    this.run.player?.setEnableTurn(false)

    const earnedPoints = this.run.reward?.getEarnedPoints() ?? 0
    ScoreStorage.saveHighScore(earnedPoints)
    if (earnedPoints > this.run.prevHighScore) {
      this.run.prevHighScore = earnedPoints
      this.run.highScoreHUD?.updateScore(earnedPoints)
    }

    AudioHelper.stopBgm(this, sourceModel.soundBgm.mappingKey)
    this.run.reward?.freeze()
    this.game.events.emit('mobileControlsEnabled', false)
    this.showGameOverOverlay(earnedPoints)
  }

  private handleShutdown(): void {
    this.run.speedUpTimer?.remove(false)
    Common.clearGameEvents(this)
    this.teardownMobileControls()
    this.input.keyboard?.off('keydown-ESC', this.handlePauseKey, this)
    this.input.keyboard?.off('keydown-P', this.handlePauseKey, this)
    if (this.onVisibilityChange) {
      document.removeEventListener('visibilitychange', this.onVisibilityChange)
      this.onVisibilityChange = undefined
    }
  }

  private setupMobileControls(): void {
    this.teardownMobileControls()

    this.game.events.off('mobileLaneUp', this.handleMobileLaneUp, this)
    this.game.events.off('mobileLaneDown', this.handleMobileLaneDown, this)
    this.game.events.on('mobileLaneUp', this.handleMobileLaneUp, this)
    this.game.events.on('mobileLaneDown', this.handleMobileLaneDown, this)

    this.scene.launch('MobileControls')
    this.game.events.emit('mobileControlsEnabled', true)
  }

  private teardownMobileControls = (): void => {
    this.game.events.off('mobileLaneUp', this.handleMobileLaneUp, this)
    this.game.events.off('mobileLaneDown', this.handleMobileLaneDown, this)
    this.game.events.emit('mobileControlsEnabled', false)

    if (this.scene.isActive('MobileControls') || this.scene.isSleeping('MobileControls')) {
      this.scene.stop('MobileControls')
    }
  }

  private handleMobileLaneUp = (): void => {
    if (this.run.isGameOver || this.run.isPaused) return
    this.run.player?.turnLeft()
  }

  private handleMobileLaneDown = (): void => {
    if (this.run.isGameOver || this.run.isPaused) return
    this.run.player?.turnRight()
  }

  private showGameOverOverlay(earnedPoints: number): void {
    const cx = this.cameras.main.width * this.gameOverLayout.screenOffsetMult.x
    const cy = this.cameras.main.height * this.gameOverLayout.screenOffsetMult.y

    this.run.gameOverImage = this.add
      .image(cx, cy, sourceModel.imageGameOver.mappingKey)
      .setOrigin(0.5, 0.5)
      .setScale(this.gameOverLayout.scale)
      .setDepth(LayerIDX.GUI + 3)
      .setAlpha(0)

    this.run.gameOverScore = this.add
      .bitmapText(cx, cy + 52, sourceModel.font.mappingKey, `SCORE ${Common.fillZeroPadding(earnedPoints, 6)}`, 42)
      .setOrigin(0.5, 0)
      .setDepth(LayerIDX.GUI + 3)
      .setAlpha(0)

    const btnScale = 0.33
    const btnHoverScale = btnScale * 1.035
    const btnY = cy + 145
    const btnGap = 210

    this.run.againButton = new BasicButton(
      this,
      new Phaser.Math.Vector2(cx - btnGap / 2, btnY),
      sourceModel.spriteAgain.mappingKey,
      LayerIDX.GUI + 3,
      btnScale,
      undefined,
      sourceModel.soundButton.mappingKey,
    )
    this.prepareGameOverButton(this.run.againButton, btnScale)

    this.run.menuButton = new BasicButton(
      this,
      new Phaser.Math.Vector2(cx + btnGap / 2, btnY),
      sourceModel.spriteMenu.mappingKey,
      LayerIDX.GUI + 3,
      btnScale,
      undefined,
      sourceModel.soundButton.mappingKey,
    )
    this.prepareGameOverButton(this.run.menuButton, btnScale)

    this.tweens.add({
      targets: [this.run.gameOverImage, this.run.gameOverScore, this.run.againButton, this.run.menuButton],
      alpha: 1,
      duration: 220,
      ease: 'Quad.easeOut',
    })

    this.time.delayedCall(280, () => {
      this.wireGameOverButton(this.run.againButton, btnScale, btnHoverScale, this.handleGameOverAgain)
      this.wireGameOverButton(this.run.menuButton, btnScale, btnHoverScale, this.handleGameOverMenu)
    })

    this.input.keyboard?.once('keydown-ENTER', this.handleGameOverAgain, this)
    this.input.keyboard?.once('keydown-SPACE', this.handleGameOverAgain, this)
    this.input.keyboard?.once('keydown-ESC', this.handleGameOverMenu, this)
    this.input.keyboard?.once('keydown-M', this.handleGameOverMenu, this)
  }

  private prepareGameOverButton(button: BasicButton, btnScale: number): void {
    button.setOrigin(0.5, 0.5)
    button.setAlpha(0)
    button.setFrame(0, false, false)
    button.setOrigin(0.5, 0.5)
    button.setInteractive(new Phaser.Geom.Rectangle(0, 0, button.width, button.height), Phaser.Geom.Rectangle.Contains)
    button.setScale(btnScale)
  }

  private wireGameOverButton(
    button: BasicButton | undefined,
    idleScale: number,
    hoverScale: number,
    handler: () => void,
  ): void {
    if (!button) return

    button.on('pointerdown', handler, this)
    button.on('pointerover', () => {
      button.setFrame(1, false, false)
      button.setOrigin(0.5, 0.5)
      button.setScale(hoverScale)
      button.playSound()
    })
    button.on('pointerout', () => {
      button.setFrame(0, false, false)
      button.setOrigin(0.5, 0.5)
      button.setScale(idleScale)
    })
  }

  private handleGameOverAgain = (): void => {
    this.scene.start('PreloadLevel', this.menuSettings)
  }

  private handleGameOverMenu = (): void => {
    this.scene.start('SceneMenu')
  }

  private prepareReward(): void {
    const highScore = ScoreStorage.getHighScore()
    this.run.prevHighScore = highScore

    if (this.run.reward) {
      this.run.reward.generateReward(this.rewardDefaults.startNumCoins)
      if (this.run.player) {
        this.run.reward.attachPlayer(this.run.player)
      }
      this.run.highScoreHUD?.updateScore(highScore)
      return
    }

    if (this.run.map && this.run.player) {
      this.run.reward = new Reward(
        this,
        this.run.map,
        this.run.player,
        this.rewardDefaults.depth,
        this.rewardDefaults.startNumCoins,
      )
    }

    this.run.scoreHUD = new ScoreHUDExtended(
      this,
      'SCORE',
      AppendFrom.LEFT,
      this.rewardDefaults.color,
      this.rewardDefaults.fontSize,
      this.rewardDefaults.textPadding,
      this.rewardDefaults.zeroPadding,
    )

    this.run.highScoreHUD = new ScoreHUD(
      this,
      'HIGHEST SCORE',
      AppendFrom.RIGHT,
      this.rewardDefaults.color,
      this.rewardDefaults.fontSize,
      this.rewardDefaults.textPadding,
      this.rewardDefaults.zeroPadding,
    )

    this.run.highScoreHUD.updateScore(highScore)
  }

  private prepareTraffic(): void {
    if (!this.run.map) return

    this.run.traffic = prepareTraffic(this, this.run.map, TRAFFIC_DEFAULTS.depth, this.run.traffic)
    this.run.traffic.generateTraffic()

    this.run.player = this.run.traffic.generateVehicle(
      this.menuSettings.vehicle,
      0,
      TRAFFIC_DEFAULTS.playerStartOffset,
      [],
      false,
    )

    this.run.traffic.attachPlayer(this.run.player)
  }
}
