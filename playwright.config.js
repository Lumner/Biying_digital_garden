import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  outputDir: "test-results",
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  workers: process.env.CI ? 2 : 4,
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "mobile-small",
      testMatch: /responsive\.spec\.js$/,
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 320, height: 740 }
      }
    },
    {
      name: "mobile-chromium",
      testMatch: [
        /accessibility\.spec\.js$/,
        /mobile-biying\.spec\.js$/,
        /responsive\.spec\.js$/
      ],
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 393, height: 851 }
      }
    },
    {
      name: "tablet-chromium",
      testMatch: /responsive\.spec\.js$/,
      use: {
        ...devices["Desktop Chrome"],
        hasTouch: true,
        viewport: { width: 768, height: 1024 }
      }
    },
    {
      name: "desktop-chromium",
      testMatch: [
        /accessibility\.spec\.js$/,
        /companion\.spec\.js$/,
        /desktop-sidebar\.spec\.js$/,
        /friend-links\.spec\.js$/,
        /no-js\.spec\.js$/,
        /page-meta\.spec\.js$/,
        /responsive\.spec\.js$/,
        /seo\.spec\.js$/,
        /smoke\.spec\.js$/
      ],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 }
      }
    },
    {
      name: "desktop-firefox",
      testMatch: [
        /responsive\.spec\.js$/,
        /smoke\.spec\.js$/
      ],
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1440, height: 900 }
      }
    }
  ]
});
