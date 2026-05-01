import { createRequire } from "node:module";
import { chromium } from "playwright";
import type { AgentPage } from "@agentnav/core";

const require = createRequire(import.meta.url);

export async function scanUrl(url: string): Promise<AgentPage> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle" });
    const scannerPath = require.resolve("@agentnav/scanner/browser");
    await page.addScriptTag({ path: scannerPath });
    return await page.evaluate(() => {
      const scanner = (window as unknown as { AgentNavScanner?: { scanCurrentPage: () => unknown } }).AgentNavScanner;
      if (!scanner) throw new Error("AgentNav scanner bundle was not loaded.");
      return scanner.scanCurrentPage();
    });
  } finally {
    await browser.close();
  }
}
