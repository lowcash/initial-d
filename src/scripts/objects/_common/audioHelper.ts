const MUTE_STORAGE_KEY = 'Muted'
const MUSIC_VOL_KEY = 'MusicVolume'
const SFX_VOL_KEY = 'SfxVolume'

const DEFAULT_MUSIC_VOL = 0.45
const DEFAULT_SFX_VOL = 1.0

/**
 * Shared mute + volume helpers. Mute and volumes persist via localStorage
 * and Phaser's global sound manager.
 */
export default class AudioHelper {
  private static sessionMuted = false
  private static sessionMusicVol = DEFAULT_MUSIC_VOL
  private static sessionSfxVol = DEFAULT_SFX_VOL

  static isMuted(): boolean {
    try {
      return localStorage.getItem(MUTE_STORAGE_KEY) === '1'
    } catch {
      return AudioHelper.sessionMuted
    }
  }

  static getMusicVolume(): number {
    try {
      const raw = localStorage.getItem(MUSIC_VOL_KEY)
      if (raw !== null) {
        const v = Number(raw)
        if (!Number.isNaN(v)) return Math.min(1, Math.max(0, v))
      }
    } catch {
      /* session fallback */
    }
    return AudioHelper.sessionMusicVol
  }

  static getSfxVolume(): number {
    try {
      const raw = localStorage.getItem(SFX_VOL_KEY)
      if (raw !== null) {
        const v = Number(raw)
        if (!Number.isNaN(v)) return Math.min(1, Math.max(0, v))
      }
    } catch {
      /* session fallback */
    }
    return AudioHelper.sessionSfxVol
  }

  static setMusicVolume(scene: Phaser.Scene, volume: number): void {
    const v = Math.min(1, Math.max(0, volume))
    AudioHelper.sessionMusicVol = v
    try {
      localStorage.setItem(MUSIC_VOL_KEY, String(v))
    } catch {
      /* ignore */
    }
    for (const sound of scene.sound.getAllPlaying()) {
      if (sound.key === 'sound_bgm' || (sound as Phaser.Sound.BaseSound).key?.includes?.('bgm')) {
        ;(sound as Phaser.Sound.WebAudioSound).setVolume?.(v)
      }
    }
    const bgm = scene.sound.get('sound_bgm')
    if (bgm && 'setVolume' in bgm) {
      ;(bgm as Phaser.Sound.WebAudioSound).setVolume(v)
    }
  }

  static setSfxVolume(volume: number): void {
    const v = Math.min(1, Math.max(0, volume))
    AudioHelper.sessionSfxVol = v
    try {
      localStorage.setItem(SFX_VOL_KEY, String(v))
    } catch {
      /* ignore */
    }
  }

  static applyMute(scene: Phaser.Scene): void {
    scene.sound.mute = AudioHelper.isMuted()
  }

  static toggleMute(scene: Phaser.Scene): boolean {
    const muted = !AudioHelper.isMuted()
    AudioHelper.sessionMuted = muted
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, muted ? '1' : '0')
    } catch {
      // storage unavailable — mute lasts for this session only
    }
    scene.sound.mute = muted
    return muted
  }

  static playBgm(scene: Phaser.Scene, key: string): void {
    AudioHelper.applyMute(scene)
    const volume = AudioHelper.getMusicVolume()

    if (scene.sound.get(key)) {
      const existing = scene.sound.get(key)
      if (!existing.isPlaying) {
        existing.play({ loop: true, volume })
      }
      return
    }

    scene.sound.add(key, { loop: true, volume }).play()
  }

  static stopBgm(scene: Phaser.Scene, key: string): void {
    const existing = scene.sound.get(key)
    if (existing) {
      existing.stop()
    }
  }

  static playSfx(scene: Phaser.Scene, key: string, config?: Phaser.Types.Sound.SoundConfig): void {
    AudioHelper.applyMute(scene)
    const volume = (config?.volume ?? 1) * AudioHelper.getSfxVolume()
    scene.sound.play(key, { ...config, volume })
  }
}
