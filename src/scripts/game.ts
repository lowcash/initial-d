import 'phaser'
import PreloadMenu from './scenes/preloadMenu'
import SceneMenu from './scenes/sceneMenu'
import PreloadLevel from './scenes/preloadLevel'
import SceneLevel from './scenes/sceneLevel'
import MobileControlsScene from './scenes/mobileControlsScene'
import FullscreenHelper from './objects/_common/fullscreenHelper'
import ScaleHelper from './objects/_common/scaleHelper'
import { initRngFromUrl } from './objects/_common/rng'

const DEFAULT_WIDTH = 1280
const DEFAULT_HEIGHT = 800

initRngFromUrl()

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  scale: {
    parent: 'initial-d-game',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    // Parent size comes from CSS (incl. safe-area); don't let Phaser fight it.
    expandParent: false,
  },
  scene: [PreloadMenu, SceneMenu, PreloadLevel, SceneLevel, MobileControlsScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 },
    },
  },
}

const game = new Phaser.Game(config)

ScaleHelper.bind(game)
FullscreenHelper.armOnFirstGesture(game)

// Expose for Playwright smoke / debugging
;(window as unknown as { __GAME__: Phaser.Game }).__GAME__ = game

export default game
