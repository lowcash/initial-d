# InitialD

Endless racing demo inspired by Initial D. Pick a car, choose controls, and dodge traffic.

Built with [Phaser 3](https://phaser.io/phaser3) and Vite.

Requires Node.js ≥ 20.19.

## Scripts

```bash
npm install
npm start            # Vite dev server
npm run build        # typecheck + production build → dist/
npm run serve        # serve dist/
npm run typecheck
npm run lint
npm run format:check
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright smoke (menu + start run)
npm run size         # bundle size budget
```

For GitHub Pages, set `BASE_PATH=/initial-d/` (or your repo name) when building.

Optional: `?seed=12345` for deterministic spawning (AI-driver groundwork).

See `PWA.md` for the service-worker decision.
