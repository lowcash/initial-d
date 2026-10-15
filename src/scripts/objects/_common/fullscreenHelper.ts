/**
 * Best-effort mobile fullscreen. Works on Android Chrome after a user gesture.
 * iOS Safari in a normal browser tab cannot leave the chrome; "Add to Home Screen"
 * (PWA, manifest display:fullscreen) is the real fullscreen path there.
 */
export default class FullscreenHelper {
  private static armed = false;

  static armOnFirstGesture(): void {
    if (FullscreenHelper.armed) {
      return;
    }

    FullscreenHelper.armed = true;

    const once = (): void => {
      document.removeEventListener('pointerdown', once);
      document.removeEventListener('touchend', once);
      FullscreenHelper.request();
    };

    document.addEventListener('pointerdown', once, { passive: true });
    document.addEventListener('touchend', once, { passive: true });
  }

  static request(): void {
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };

    const req = el.requestFullscreen?.bind(el) ?? el.webkitRequestFullscreen?.bind(el);
    if (!req) {
      return;
    }

    try {
      const result = req();
      if (result && typeof (result as Promise<void>).catch === 'function') {
        (result as Promise<void>).catch(() => undefined);
      }
    } catch {
      // Ignore — browser may reject without a trusted gesture or on iOS.
    }
  }
}
