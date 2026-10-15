const HIGH_SCORE_KEY = 'HighScore';

export default class ScoreStorage {
  static getHighScore(): number {
    const raw = localStorage.getItem(HIGH_SCORE_KEY);
    if (!raw) {
      return 0;
    }

    try {
      return JSON.parse(raw) as number;
    } catch {
      return 0;
    }
  }

  static saveHighScore(score: number): void {
    if (score > ScoreStorage.getHighScore()) {
      localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(score));
    }
  }
}
