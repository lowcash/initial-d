import { describe, expect, it } from 'vitest'
import { nextSpeed, SPEED_MAX, SPEED_RAMP_PER_TICK, SPEED_START } from '../../src/scripts/models/tuning'

describe('nextSpeed', () => {
  it('ramps toward more negative speed from start', () => {
    const stepped = nextSpeed(SPEED_START)
    expect(stepped).toBe(SPEED_START - SPEED_RAMP_PER_TICK)
  })

  it('caps at SPEED_MAX', () => {
    expect(nextSpeed(SPEED_MAX)).toBe(SPEED_MAX)
    expect(nextSpeed(SPEED_MAX + 0.05)).toBe(SPEED_MAX)
    expect(nextSpeed(-100)).toBe(SPEED_MAX)
  })

  it('stays playable under chunk size budget', () => {
    // Chunk is 416px; capped |speed| must be well below that per frame.
    expect(Math.abs(SPEED_MAX)).toBeLessThanOrEqual(16)
    expect(Math.abs(SPEED_MAX)).toBeGreaterThanOrEqual(12)
  })
})
