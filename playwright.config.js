/**
 * Playwright configuration for E2E testing
 */
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  outputDir: 'tests/screenshots',
  webServer: [
    {
      command: 'node dataServer.js',
      url: 'http://localhost:3002/api/cities',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
})
