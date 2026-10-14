import { expect, test } from "@playwright/test";

test("creator can enter and leave the demo workspace", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("creator-demo@example.test");
  await page.getByLabel("Password").fill("demo-password");
  await page.getByRole("button", { name: "Enter demo workspace" }).click();

  await expect(page).toHaveURL(/\/creators$/);
  await expect(page.getByRole("heading", { name: "Creator discovery" })).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("brand can enter the demo brief workspace", async ({ page }) => {
  await page.goto("/register");
  await page.getByRole("button", { name: "Create demo account" }).click();

  await expect(page).toHaveURL(/\/briefs$/);
  await expect(page.getByRole("heading", { name: "Creative briefs" })).toBeVisible();
});
