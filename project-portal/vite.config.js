import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      input: {
        app: resolve(projectRoot, 'index.html'),
        portfolio: resolve(projectRoot, 'portfolio/index.html'),
      },
    },
  },
})
