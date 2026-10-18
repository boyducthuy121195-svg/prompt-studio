import { defineConfig, devices } from '@playwright/test'

// Trên máy cá nhân: chạy `npx playwright install chromium` một lần trước khi dùng `npm run test:e2e`.
// Môi trường có sẵn Chromium riêng có thể chỉ đường dẫn qua biến PLAYWRIGHT_CHROMIUM_PATH.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: executablePath ? { executablePath } : {},
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
