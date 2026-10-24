/**
 * Keep Phaser Scale.FIT in sync with the real visible viewport.
 * Mobile browsers / PWAs change size after boot (chrome, fullscreen, orientation)
 * without always firing a plain window resize Phaser listens to.
 */
export default class ScaleHelper {
  private static bound = false;

  static bind(game: Phaser.Game): void {
    if (ScaleHelper.bound) {
      return;
    }

    ScaleHelper.bound = true;

    const refresh = (): void => {
      game.scale.refresh();
    };

    const refreshSoon = (): void => {
      refresh();
      window.setTimeout(refresh, 100);
      window.setTimeout(refresh, 400);
    };

    window.addEventListener('resize', refresh);
    window.addEventListener('orientationchange', refreshSoon);
    document.addEventListener('fullscreenchange', refreshSoon);
    document.addEventListener('webkitfullscreenchange', refreshSoon);

    // visualViewport is missing from older DOM libs used by this project.
    const vv = (window as Window & {
      visualViewport?: { addEventListener: (type: string, listener: () => void) => void };
    }).visualViewport;
    vv?.addEventListener('resize', refresh);
    vv?.addEventListener('scroll', refresh);

    // iOS PWA: manifest display mode often applies after first paint.
    if (document.readyState === 'complete') {
      refreshSoon();
    } else {
      window.addEventListener('load', refreshSoon, { once: true });
    }
  }

  static refresh(game: Phaser.Game): void {
    game.scale.refresh();
  }
}
