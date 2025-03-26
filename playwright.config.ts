import { defineConfig } from "@playwright/test";
import { ENV } from "./config";
import path from "path";

export default defineConfig({
    testDir: process.env.TEST_DIR || path.join(__dirname, "."), // Replace 'your-test-directory' with the actual directory
    timeout: 30000,
    retries: 0,
    use: {
        baseURL: process.env.BASE_URL || ENV.BASE_URL,
        headless: true, //ENV.HEADLESS,
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
    ],
});
