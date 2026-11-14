/** Mulberry32 seeded PRNG for deterministic spawn groundwork (`?seed=`). */
type RngFn = () => number

let rng: RngFn = Math.random

export function mulberry32(seed: number): RngFn {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Read `?seed=` from the page URL and install the RNG. */
export function initRngFromUrl(
  search: string = typeof location !== 'undefined' ? location.search : '',
): number | undefined {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const raw = params.get('seed')
  if (raw === null || raw === '') {
    rng = Math.random
    return undefined
  }
  const seed = /^\d+$/.test(raw) ? Number(raw) >>> 0 : hashSeed(raw)
  rng = mulberry32(seed)
  return seed
}

export function setSeed(seed: number): void {
  rng = mulberry32(seed >>> 0)
}

export function random(): number {
  return rng()
}

/** Inclusive integer range, matching Phaser.Math.Between semantics. */
export function randomInt(min: number, max: number): number {
  const lo = Math.ceil(min)
  const hi = Math.floor(max)
  return Math.floor(random() * (hi - lo + 1)) + lo
}

export function randomFloat(min: number, max: number): number {
  return random() * (max - min) + min
}
