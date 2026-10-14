import { expect, test } from "@playwright/test";

test("creator can enter and leave the demo workspace", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("creator-demo@example.test");
  await page.getByLabel("Password").fill("demo-password");
  await page.getByRole("button", { name: "Enter demo workspace" }).click();

  await expect(page).toHaveURL(/\/creators$/);
  await expect(page.getByRole("heading", { name: "Creator discovery" })).toBeVisible();
  await page.getByRole("link", { name: "Workspace" }).first().click();
  await expect(page).toHaveURL(/\/creator$/);
  await expect(page.getByRole("heading", { name: /Good to see you/ })).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("brand can enter the demo briefs and workspace", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/login");
  await page.getByLabel("Email").fill("brand-demo@example.test");
  await page.getByLabel("Password").fill("demo-password");
  await page.getByRole("button", { name: "Enter demo workspace" }).click();
  await expect(page).toHaveURL(/\/briefs$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "Creative briefs" })).toBeVisible();
  await page.getByRole("link", { name: "Workspace" }).first().click();
  await expect(page).toHaveURL(/\/brand$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "Sample briefs" })).toBeVisible();
});

test("demo discovery APIs return bundled creator and brief data", async ({ request }) => {
  const [creatorsResponse, briefsResponse] = await Promise.all([
    request.get("/api/creators"),
    request.get("/api/briefs"),
  ]);

  expect(creatorsResponse.ok()).toBeTruthy();
  expect(briefsResponse.ok()).toBeTruthy();

  const creators = await creatorsResponse.json();
  const briefs = await briefsResponse.json();
  expect(creators.usingDemo).toBe(true);
  expect(creators.creators.length).toBeGreaterThan(0);
  expect(briefs.usingDemo).toBe(true);
  expect(briefs.briefs.length).toBeGreaterThan(0);
});
