/**
 * Shared gameplay tuning.
 * Speed is negative (road scrolls left). Cap keeps |speed| within what
 * chunk recycling (416 px tiles) can absorb in a single frame budget.
 */
export const SPEED_START = -1.0
/** Magnitude added each ramp tick (speed becomes more negative). */
export const SPEED_RAMP_PER_TICK = 0.1
export const SPEED_RAMP_INTERVAL_MS = 100
/**
 * Most-negative allowed map speed (px/frame at 60fps scale).
 * ~14 keeps long runs playable while chunk recycle (while-loop) stays ahead.
 */
export const SPEED_MAX = -14

/** Apply one ramp step toward SPEED_MAX (never below it). */
export function nextSpeed(current: number, rampPerTick: number = SPEED_RAMP_PER_TICK, max: number = SPEED_MAX): number {
  return Math.max(current - rampPerTick, max)
}
