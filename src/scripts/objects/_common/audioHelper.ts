const MUTE_STORAGE_KEY = 'Muted';

/**
 * Shared mute + BGM helpers. Mute persists across scenes via localStorage
 * and Phaser's global sound manager.
 */
export default class AudioHelper {
  private static sessionMuted = false;

  static isMuted(): boolean {
    try {
      return localStorage.getItem(MUTE_STORAGE_KEY) === '1';
    } catch {
      return AudioHelper.sessionMuted;
    }
  }

  static applyMute(scene: Phaser.Scene): void {
    scene.sound.mute = AudioHelper.isMuted();
  }

  static toggleMute(scene: Phaser.Scene): boolean {
    const muted = !AudioHelper.isMuted();
    AudioHelper.sessionMuted = muted;
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, muted ? '1' : '0');
    } catch {
      // storage unavailable — mute lasts for this session only
    }
    scene.sound.mute = muted;
    return muted;
  }

  static playBgm(scene: Phaser.Scene, key: string): void {
    AudioHelper.applyMute(scene);

    if (scene.sound.get(key)) {
      const existing = scene.sound.get(key);
      if (!existing.isPlaying) {
        existing.play({ loop: true, volume: 0.45 });
      }
      return;
    }

    scene.sound.add(key, { loop: true, volume: 0.45 }).play();
  }

  static stopBgm(scene: Phaser.Scene, key: string): void {
    const existing = scene.sound.get(key);
    if (existing) {
      existing.stop();
    }
  }
}
