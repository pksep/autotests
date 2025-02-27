import { defineConfig } from "@playwright/test";
import { ENV } from "./config";

import path from "path";

export default defineConfig({
    testDir: "D:/Work/sep_autotests", // Directory where your test files are located
    timeout: 30000,
    retries: 0,
    use: {
        baseURL: ENV.BASE_URL,
        headless: ENV.HEADLESS,
        viewport: { width: 1920, height: 929 },
        actionTimeout: 10000,
        ignoreHTTPSErrors: true,
        screenshot: "only-on-failure",
    },
    projects: [
        {
            name: ENV.TEST_SUITE,
            testMatch: "**/main.spec.ts", // Match the dynamically generated test entry point
        },
    ],
    reporter: [
        ["line"], // Console output
        ["allure-playwright"], // Allure reporter
    ], // Run setupTests.ts before tests
});
