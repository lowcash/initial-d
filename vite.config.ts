import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const base = process.env.BASE_PATH || process.env.VITE_BASE || '/'

export default defineConfig({
  root: '.',
  base,
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        // Copy shipped assets only — originals/ stays out of dist
        { src: 'src/assets/img', dest: 'assets' },
        { src: 'src/assets/sound', dest: 'assets' },
        { src: 'pwa/manifest.json', dest: '.' },
        { src: 'pwa/icons/*', dest: 'icons' },
        { src: 'src/favicon.ico', dest: '.' },
      ],
    }),
  ],
})
