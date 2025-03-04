import { test, expect } from "@playwright/test";
import { performLogin } from "./TC000.spec"; //

export const runU003 = (isSignleTest: boolean, iterations: number) => {
    console.log(
        `Starting test: Verify Order From Suppliers Page Functionality`
    );
};

test.beforeEach("Test Case 00 - Authorization", async ({ page }) => {
    await performLogin(page, "001", "Перов Д.А.", "54321");
    await page.click("button.btn.blues");
});
