import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  workers: 1,
  expect: {
    timeout: 7_500,
  },
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5177',
    trace: 'retain-on-failure',
    viewport: { width: 820, height: 1180 },
  },
  projects: [
    {
      name: 'tablet-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 820, height: 1180 },
      },
    },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5177',
    url: 'http://127.0.0.1:5177',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
