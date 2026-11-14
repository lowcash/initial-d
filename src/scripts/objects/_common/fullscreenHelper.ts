import ScaleHelper from './scaleHelper'

/**
 * Best-effort mobile fullscreen. Works on Android Chrome after a user gesture.
 * iOS Safari in a normal browser tab cannot leave the chrome; "Add to Home Screen"
 * (PWA, manifest display:fullscreen) is the real fullscreen path there.
 */
export default class FullscreenHelper {
  private static armed = false

  static armOnFirstGesture(game?: Phaser.Game): void {
    if (FullscreenHelper.armed) {
      return
    }

    FullscreenHelper.armed = true

    const once = (): void => {
      document.removeEventListener('pointerdown', once)
      document.removeEventListener('touchend', once)
      FullscreenHelper.request(game)
    }

    document.addEventListener('pointerdown', once, { passive: true })
    document.addEventListener('touchend', once, { passive: true })
  }

  static request(game?: Phaser.Game): void {
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void
    }

    const req = el.requestFullscreen?.bind(el) ?? el.webkitRequestFullscreen?.bind(el)
    if (!req) {
      return
    }

    const after = (): void => {
      if (game) {
        ScaleHelper.refresh(game)
        window.setTimeout(() => ScaleHelper.refresh(game), 100)
        window.setTimeout(() => ScaleHelper.refresh(game), 400)
      }
    }

    try {
      const result = req()
      if (result && typeof (result as Promise<void>).then === 'function') {
        ;(result as Promise<void>).then(after).catch(() => undefined)
      } else {
        after()
      }
    } catch {
      // Ignore — browser may reject without a trusted gesture or on iOS.
    }
  }
}
