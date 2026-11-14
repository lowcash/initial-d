#!/usr/bin/env node
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const DIST = path.resolve('dist')
const MAX_JS_TOTAL_BYTES = 2.5 * 1024 * 1024 // Phaser vendors dominate; keep a sane ceiling

async function collectJs(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectJs(full)))
    } else if (entry.name.endsWith('.js')) {
      files.push(full)
    }
  }
  return files
}

const jsFiles = await collectJs(DIST)
let total = 0
for (const file of jsFiles) {
  const s = await stat(file)
  total += s.size
  console.log(`${(s.size / 1024).toFixed(1)} KiB\t${path.relative(DIST, file)}`)
}
console.log(`TOTAL JS: ${(total / 1024).toFixed(1)} KiB`)

if (total > MAX_JS_TOTAL_BYTES) {
  console.error(`Bundle size ${total} exceeds limit ${MAX_JS_TOTAL_BYTES}`)
  process.exit(1)
}
