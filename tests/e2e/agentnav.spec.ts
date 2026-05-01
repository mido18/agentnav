import { execFileSync } from "node:child_process";
import { expect, test } from "@playwright/test";

test("metadata endpoints respond", async ({ request }) => {
  const llms = await request.get("/llms.txt");
  expect(llms.headers()["content-type"]).toContain("text/plain");
  expect(await llms.text()).toContain("# Hyde Park");

  const agent = await request.get("/.well-known/agent.json");
  expect(agent.ok()).toBe(true);
  expect((await agent.json()).site.name).toBe("Hyde Park");

  const actions = await request.get("/.well-known/actions.json");
  expect(actions.ok()).toBe(true);
  expect((await actions.json()).actions.length).toBeGreaterThan(0);
});

test("units page exposes data-agent entity attributes", async ({ page }) => {
  await page.goto("/units");
  await expect(page.locator("[data-agent-entity='real_estate_unit']")).toHaveCount(3);
  await expect(page.locator("[data-agent-action='book_viewing_villa-a']")).toHaveAttribute(
    "data-agent-requires-confirmation",
    "true"
  );
});

test("booking page exposes form metadata and runtime scanner", async ({ page }) => {
  await page.goto("/book-viewing");
  await expect(page.locator("[data-agent-form='lead_capture']")).toBeVisible();
  await page.waitForFunction(() => Boolean(window.AgentNav?.scan));
  const scan = await page.evaluate(() => window.AgentNav?.scan());
  expect(scan?.forms.length).toBeGreaterThan(0);
  expect(scan?.score.score).toBeGreaterThan(0);
});

test("score command returns grade and warnings", async () => {
  const output = execFileSync("pnpm", ["agentnav", "score", "http://127.0.0.1:3000"], {
    cwd: process.cwd(),
    encoding: "utf8",
    timeout: 120_000
  });
  expect(output).toContain("Agent Readiness Score:");
});
