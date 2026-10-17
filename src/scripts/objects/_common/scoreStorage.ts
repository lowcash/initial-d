const HIGH_SCORE_KEY = 'HighScore';

/** localStorage can throw (private mode, blocked site data) — the game must still run without it. */
export default class ScoreStorage {
  static getHighScore(): number {
    try {
      const value = Number(JSON.parse(localStorage.getItem(HIGH_SCORE_KEY) ?? '0'));

      return Number.isFinite(value) && value > 0 ? value : 0;
    } catch {
      return 0;
    }
  }

  static saveHighScore(score: number): void {
    try {
      if (score > ScoreStorage.getHighScore()) {
        localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(score));
      }
    } catch {
      // storage unavailable — score just isn't persisted
    }
  }
}
