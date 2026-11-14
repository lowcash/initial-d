import { describe, expect, it } from 'vitest'
import { mulberry32, randomInt, setSeed } from '../../src/scripts/objects/_common/rng'

describe('mulberry32', () => {
  it('is deterministic for the same seed', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    const seqA = [a(), a(), a(), a(), a()]
    const seqB = [b(), b(), b(), b(), b()]
    expect(seqA).toEqual(seqB)
  })

  it('randomInt stays inclusive', () => {
    setSeed(7)
    for (let i = 0; i < 50; i++) {
      const n = randomInt(2, 5)
      expect(n).toBeGreaterThanOrEqual(2)
      expect(n).toBeLessThanOrEqual(5)
    }
  })
})
