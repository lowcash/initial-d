import { test, expect } from '@playwright/test'

test('menu loads and a run starts without console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto('/')
  await page.waitForFunction(() => !!(window as unknown as { __GAME__?: unknown }).__GAME__, null, {
    timeout: 30_000,
  })

  // Wait for menu scene assets / start button texture
  await page.waitForTimeout(1500)

  const started = await page.evaluate(async () => {
    const w = window as unknown as {
      __GAME__?: {
        scene: {
          getScene: (k: string) => { scene: { isActive: () => boolean } }
          start: (k: string, data: unknown) => void
        }
      }
    }
    const game = w.__GAME__
    if (!game) return false

    const menu = game.scene.getScene('SceneMenu')
    if (menu && menu.scene.isActive()) {
      game.scene.start('PreloadLevel', { deviceType: 0, vehicle: 'ae_86_trueno' })
    }

    await new Promise((r) => setTimeout(r, 2500))
    const level = game.scene.getScene('SceneLevel')
    return !!(level && level.scene.isActive())
  })

  expect(started).toBe(true)
  expect(errors).toEqual([])
})
