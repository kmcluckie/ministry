import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30000, // 30s for integration tests
    projects: [
      {
        test: {
          name: 'unit',
          include: ['server/**/*.{test,spec}.ts', 'shared/**/*.{test,spec}.ts'],
          environment: 'node',
          setupFiles: ['./tests/setup.ts']
        }
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['app/**/*.{test,spec}.ts', 'components/**/*.{test,spec}.ts', 'pages/**/*.{test,spec}.ts'],
          environment: 'nuxt',
          environmentOptions: {
            nuxt: {
              domEnvironment: 'happy-dom'
            }
          }
        }
      })
    ]
  }
})