import Map from '../objects/map/map'
import Traffic from '../objects/traffic/traffic'
import Vehicle from '../objects/traffic/vehicle'
import Reward from '../objects/reward/reward'
import ScoreHUD, { ScoreHUDExtended } from '../objects/reward/hud'
import BasicButton from '../objects/buttons/basicButton'
import { BackgroundLayers, createBackgroundLayerConfigs } from '../objects/background/backgroundLayers'

/** Per-run mutable scene state — reset by creating a fresh instance in `create()`. */
export class MenuRunState {
  backgrounds: BackgroundLayers = createBackgroundLayerConfigs()
  map?: Map
  traffic?: Traffic
  startButton?: BasicButton
  logo?: Phaser.GameObjects.Image
  vehiclesGroup?: Phaser.GameObjects.Group
  vehiclesMapping: { [id: string]: Phaser.GameObjects.Image } = {}
  vehiclesPanelBottom = 0
}

export class LevelRunState {
  backgrounds: BackgroundLayers = createBackgroundLayerConfigs()
  map?: Map
  traffic?: Traffic
  player?: Vehicle
  reward?: Reward
  scoreHUD?: ScoreHUDExtended
  highScoreHUD?: ScoreHUD
  speedUpTimer?: Phaser.Time.TimerEvent
  gameOverImage?: Phaser.GameObjects.Image
  gameOverScore?: Phaser.GameObjects.BitmapText
  againButton?: BasicButton
  menuButton?: BasicButton
  cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  wasd?: {
    W: Phaser.Input.Keyboard.Key
    A: Phaser.Input.Keyboard.Key
    S: Phaser.Input.Keyboard.Key
    D: Phaser.Input.Keyboard.Key
  }
  isGameOver = false
  isPaused = false
  pauseOverlay?: Phaser.GameObjects.Container
  prevHighScore = 0
}
