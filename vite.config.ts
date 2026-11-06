import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    base: env.VITE_BASE_URL || '/',
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                // The 3D route loads Three.js on demand; cache its core separately.
                name: 'three-core',
                test: /node_modules[\\/]three[\\/]build[\\/]three\.core\.js/,
              },
            ],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
