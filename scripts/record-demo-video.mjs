import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const assetsDir = path.join(rootDir, "docs", "marketing", "assets");
const outputWebm = path.join(assetsDir, "agentnav-demo.webm");
const outputMp4 = path.join(assetsDir, "agentnav-demo.mp4");
const port = Number(process.env.AGENTNAV_DEMO_PORT ?? 3000);
const baseUrl = `http://127.0.0.1:${port}`;
const durationMs = 91_000;

function log(message) {
  process.stdout.write(`[demo-video] ${message}\n`);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
      ...options
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} ${args.join(" ")} failed with ${code}\n${stdout}\n${stderr}`));
    });
  });
}

async function waitForServer() {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/units`);
      if (response.ok) return;
    } catch {
      // Keep polling while Next starts.
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error(`Timed out waiting for ${baseUrl}`);
}

async function startServer() {
  try {
    const response = await fetch(`${baseUrl}/units`);
    if (response.ok) {
      log(`Using existing server at ${baseUrl}`);
      return undefined;
    }
  } catch {
    // Start a server below.
  }

  log("Starting example app");
  const child = spawn(
    "npx",
    ["pnpm@10.10.0", "--filter", "next-real-estate", "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: rootDir,
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  child.stdout.on("data", (chunk) => process.stdout.write(`[next] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[next] ${chunk}`));

  await waitForServer();
  return child;
}

async function screenshotPage(browser, targetUrl, destination, options = {}) {
  const page = await browser.newPage({
    viewport: options.viewport ?? { width: 1040, height: 620 },
    deviceScaleFactor: 1
  });
  await page.goto(targetUrl, { waitUntil: "networkidle" });
  await page.screenshot({ path: destination, fullPage: false });
  await page.close();
}

async function screenshotEndpoint(browser, targetUrl, destination, title) {
  const response = await fetch(targetUrl);
  const text = await response.text();
  const body = escapeHtml(text.length > 2_600 ? `${text.slice(0, 2_600)}\n...` : text);
  const html = `<!doctype html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            width: 1040px;
            height: 620px;
            background: #f8fafc;
            color: #0f172a;
            font: 16px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          }
          header {
            height: 58px;
            display: flex;
            align-items: center;
            padding: 0 22px;
            color: #f8fafc;
            background: #0f766e;
            font: 700 20px/1.2 Inter, ui-sans-serif, system-ui, sans-serif;
          }
          pre {
            margin: 0;
            padding: 20px 24px;
            white-space: pre-wrap;
            word-break: break-word;
          }
        </style>
      </head>
      <body>
        <header>${escapeHtml(title)}</header>
        <pre>${body}</pre>
      </body>
    </html>`;
  const page = await browser.newPage({ viewport: { width: 1040, height: 620 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path: destination });
  await page.close();
}

async function imageDataUri(filePath) {
  const bytes = await readFile(filePath);
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

function codeBlock(source, highlights = []) {
  const lines = source.trim().split("\n");
  return `<pre>${lines
    .map((line, index) => {
      const number = index + 1;
      const highlighted = highlights.includes(number) ? " highlighted" : "";
      return `<span class="line${highlighted}"><span class="ln">${number}</span>${escapeHtml(line)}</span>`;
    })
    .join("")}</pre>`;
}

function makeHtml({ screenshots }) {
  const scenes = [
    {
      start: 0,
      end: 10,
      title: "The web is still mostly human-readable",
      browserImages: [screenshots.units],
      editorTitle: "Ambiguous UI",
      editor: codeBlock(`<button>Book Viewing</button>
<form>
  <input name="phone" />
</form>`, [1, 3]),
      terminal: `AI agent sees:
• a button
• a form field
• no stable risk model`,
      caption:
        "AI agents can read websites, but they do not know which content is critical, which actions are safe, or which forms need human confirmation."
    },
    {
      start: 10,
      end: 25,
      title: "AgentNav adds an agent-readiness layer",
      browserImages: [screenshots.home, screenshots.units],
      editorTitle: "What AgentNav exposes",
      editor: codeBlock(`/llms.txt
/.well-known/agent.json
/.well-known/actions.json
Schema.org JSON-LD
data-agent-* attributes
form metadata
safety rules
readiness score`, [1, 2, 3, 7, 8]),
      terminal: `pnpm add @agentnav/react @agentnav/next

Lighthouse for AI agents.
Built for React and Next.js.`,
      caption:
        "AgentNav is the agent-readiness layer for React and Next.js. It adds structured metadata, safe action annotations, and a Lighthouse-style score."
    },
    {
      start: 25,
      end: 45,
      title: "Make important UI explicit",
      browserImages: [screenshots.units],
      editorTitle: "React annotation",
      editor: codeBlock(`<AgentEntity type="real_estate_unit" id="villa-a" name="Villa Type A">
  <AgentField name="price" value={12500000} currency="EGP">
    12,500,000 EGP
  </AgentField>

  <AgentAction
    id="book_viewing"
    type="book"
    risk="booking"
    requiresUserConfirmation
  >
    <button>Book Viewing</button>
  </AgentAction>
</AgentEntity>`, [1, 2, 6, 9, 10]),
      terminal: `Rendered HTML includes:
data-agent-entity="real_estate_unit"
data-agent-field="price"
data-agent-action="book_viewing"`,
      caption:
        "This listing is now machine-readable: the unit, price, bedrooms, and booking button are explicit."
    },
    {
      start: 45,
      end: 60,
      title: "Next.js routes publish metadata",
      browserImages: [screenshots.llms, screenshots.agentJson, screenshots.actionsJson],
      editorTitle: "agentnav.config.ts",
      editor: codeBlock(`export default defineAgentNavConfig({
  siteName: "Hyde Park",
  domain: "https://example.com",
  purpose: "Real estate sales",
  importantPages: [
    { title: "Available Units", url: "/units" }
  ],
  policies: {
    requiresConfirmation: ["submit_lead", "book_viewing"]
  }
});`, [1, 5, 8, 9]),
      terminal: `open /llms.txt
open /.well-known/agent.json
open /.well-known/actions.json`,
      caption: "Next.js routes publish the agent guide, site policy, and stable actions."
    },
    {
      start: 60,
      end: 75,
      title: "Sensitive actions require confirmation",
      browserImages: [screenshots.units],
      editorTitle: "Safety metadata",
      editor: codeBlock(`<button
  data-agent-action="book_viewing"
  data-agent-action-type="book"
  data-agent-risk="booking"
  data-agent-requires-confirmation="true"
>
  Book Viewing
</button>`, [4, 5]),
      terminal: `Safety normalization:
safe: false
requiresUserConfirmation: true
risk: "booking"`,
      caption:
        "Sensitive actions are not marked safe. Booking, payment, personal data, account changes, legal, medical, and destructive actions require human confirmation."
    },
    {
      start: 75,
      end: 91,
      title: "Score agent-readiness",
      browserImages: [screenshots.units],
      editorTitle: "CLI score",
      editor: codeBlock(`pnpm agentnav score http://localhost:3000/units

Agent Readiness Score: 91/100 — A

High priority fixes:
1. No last-updated metadata found.`, [1, 3]),
      terminal: `Agent Readiness Score: 91/100 — A

Page identity: clear
Actions: explicit
Safety: confirmed`,
      caption:
        "If you build React or Next.js sites, AgentNav helps you make them readable, navigable, actionable, and safer for AI agents."
    }
  ];

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      --ink: #111827;
      --accent: #0f766e;
      --bg: #0b1220;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: 1280px;
      height: 720px;
      overflow: hidden;
      color: var(--ink);
      background: var(--bg);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .stage {
      position: relative;
      width: 1280px;
      height: 720px;
      padding: 24px;
      background:
        radial-gradient(circle at 80% 18%, rgba(15, 118, 110, 0.22), transparent 32%),
        linear-gradient(135deg, #0b1220 0%, #132033 100%);
    }
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 54px;
      color: #f8fafc;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 26px;
      font-weight: 900;
    }
    .mark {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: var(--accent);
      box-shadow: inset 0 0 0 6px rgba(255,255,255,0.18);
    }
    .tagline {
      color: #bfdbfe;
      font-size: 20px;
      font-weight: 750;
    }
    .title {
      margin: 10px 0 18px;
      color: #ffffff;
      font-size: 39px;
      line-height: 1.05;
      font-weight: 950;
      letter-spacing: 0;
    }
    .grid {
      display: grid;
      grid-template-columns: 1.16fr 0.84fr;
      gap: 16px;
      height: 474px;
    }
    .panel {
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 10px;
      background: #f8fafc;
      box-shadow: 0 18px 55px rgba(0,0,0,0.28);
    }
    .panelHeader {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 34px;
      padding: 0 14px;
      color: #f8fafc;
      background: #111827;
      font-size: 13px;
      font-weight: 800;
    }
    .dot { width: 9px; height: 9px; border-radius: 999px; background: #fb7185; }
    .dot:nth-child(2) { background: #fbbf24; }
    .dot:nth-child(3) { background: #34d399; }
    .browserBody {
      position: relative;
      height: calc(100% - 34px);
      background: #e5e7eb;
    }
    .browserBody img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: opacity 320ms ease;
    }
    .editorBody {
      height: calc(100% - 34px);
      padding: 16px;
      background: #0f172a;
      color: #dbeafe;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 14px;
      line-height: 1.52;
    }
    .editorBody pre { margin: 0; }
    .line {
      display: block;
      min-height: 20px;
      padding: 0 8px 0 0;
      border-radius: 5px;
      white-space: pre;
    }
    .line.highlighted {
      color: #ecfeff;
      background: rgba(20, 184, 166, 0.22);
    }
    .ln {
      display: inline-block;
      width: 28px;
      margin-right: 12px;
      color: #64748b;
      user-select: none;
      text-align: right;
    }
    .bottom {
      display: grid;
      grid-template-columns: 0.9fr 1.1fr;
      gap: 16px;
      margin-top: 16px;
      height: 105px;
    }
    .terminal {
      padding: 14px 18px;
      border-radius: 10px;
      background: #020617;
      color: #bbf7d0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 16px;
      line-height: 1.38;
      white-space: pre-wrap;
      box-shadow: 0 18px 55px rgba(0,0,0,0.22);
    }
    .caption {
      display: flex;
      align-items: center;
      padding: 16px 18px;
      border-radius: 10px;
      background: #f8fafc;
      color: #1e293b;
      font-size: 23px;
      line-height: 1.25;
      font-weight: 800;
    }
    .progress {
      position: absolute;
      left: 24px;
      right: 24px;
      bottom: 13px;
      height: 6px;
      border-radius: 999px;
      background: rgba(255,255,255,0.17);
      overflow: hidden;
    }
    .progressInner {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #2dd4bf, #facc15);
    }
  </style>
</head>
<body>
  <main class="stage">
    <div class="top">
      <div class="brand"><span class="mark"></span>AgentNav</div>
      <div class="tagline">Lighthouse for AI agents • React + Next.js</div>
    </div>
    <h1 class="title" id="title"></h1>
    <section class="grid">
      <div class="panel">
        <div class="panelHeader"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span>http://localhost:3000</span></div>
        <div class="browserBody"><img id="browserImage" alt="" /></div>
      </div>
      <div class="panel">
        <div class="panelHeader"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span id="editorTitle"></span></div>
        <div class="editorBody" id="editor"></div>
      </div>
    </section>
    <section class="bottom">
      <div class="terminal" id="terminal"></div>
      <div class="caption" id="caption"></div>
    </section>
    <div class="progress"><div class="progressInner" id="progress"></div></div>
  </main>
  <script>
    const scenes = ${JSON.stringify(scenes)};
    let startedAt = null;
    let currentScene = -1;
    let currentImage = "";

    function activeScene(seconds) {
      return scenes.find((scene) => seconds >= scene.start && seconds < scene.end) || scenes[scenes.length - 1];
    }

    function render() {
      if (startedAt === null) return;
      const elapsed = (performance.now() - startedAt) / 1000;
      const scene = activeScene(elapsed);
      const sceneIndex = scenes.indexOf(scene);
      const local = elapsed - scene.start;
      const duration = scene.end - scene.start;
      const imageIndex = Math.min(scene.browserImages.length - 1, Math.floor((local / duration) * scene.browserImages.length));
      const image = scene.browserImages[imageIndex];

      if (sceneIndex !== currentScene) {
        currentScene = sceneIndex;
        document.getElementById("title").textContent = scene.title;
        document.getElementById("editorTitle").textContent = scene.editorTitle;
        document.getElementById("editor").innerHTML = scene.editor;
        document.getElementById("terminal").textContent = scene.terminal;
        document.getElementById("caption").textContent = scene.caption;
      }
      if (image !== currentImage) {
        currentImage = image;
        document.getElementById("browserImage").src = image;
      }
      document.getElementById("progress").style.width = Math.min(100, (elapsed / 91) * 100) + "%";
      requestAnimationFrame(render);
    }

    window.__startAgentNavDemo = () => {
      startedAt = performance.now();
      render();
    };
    document.getElementById("title").textContent = scenes[0].title;
    document.getElementById("editorTitle").textContent = scenes[0].editorTitle;
    document.getElementById("editor").innerHTML = scenes[0].editor;
    document.getElementById("terminal").textContent = scenes[0].terminal;
    document.getElementById("caption").textContent = scenes[0].caption;
    document.getElementById("browserImage").src = scenes[0].browserImages[0];
  </script>
</body>
</html>`;
}

async function convertToMp4(input, output) {
  log("Converting WebM to MP4");
  await run("ffmpeg", [
    "-y",
    "-i",
    input,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-an",
    output
  ]);
}

async function main() {
  await mkdir(assetsDir, { recursive: true });
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "agentnav-demo-"));
  let server;
  let browser;

  try {
    server = await startServer();
    browser = await chromium.launch({ headless: true });

    const screenshotPaths = {
      home: path.join(tmpDir, "home.png"),
      units: path.join(tmpDir, "units.png"),
      llms: path.join(tmpDir, "llms.png"),
      agentJson: path.join(tmpDir, "agent-json.png"),
      actionsJson: path.join(tmpDir, "actions-json.png")
    };

    log("Capturing app and metadata screenshots");
    await screenshotPage(browser, `${baseUrl}/`, screenshotPaths.home);
    await screenshotPage(browser, `${baseUrl}/units`, screenshotPaths.units);
    await screenshotEndpoint(browser, `${baseUrl}/llms.txt`, screenshotPaths.llms, "/llms.txt");
    await screenshotEndpoint(browser, `${baseUrl}/.well-known/agent.json`, screenshotPaths.agentJson, "/.well-known/agent.json");
    await screenshotEndpoint(browser, `${baseUrl}/.well-known/actions.json`, screenshotPaths.actionsJson, "/.well-known/actions.json");
    await browser.close();
    browser = undefined;

    const screenshots = {
      home: await imageDataUri(screenshotPaths.home),
      units: await imageDataUri(screenshotPaths.units),
      llms: await imageDataUri(screenshotPaths.llms),
      agentJson: await imageDataUri(screenshotPaths.agentJson),
      actionsJson: await imageDataUri(screenshotPaths.actionsJson)
    };

    const renderHtml = path.join(tmpDir, "agentnav-demo.html");
    await writeFile(renderHtml, makeHtml({ screenshots }), "utf8");

    log("Recording 90-second demo");
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
      recordVideo: {
        dir: tmpDir,
        size: { width: 1280, height: 720 }
      }
    });
    const page = await context.newPage();
    await page.goto(pathToFileURL(renderHtml).href, { waitUntil: "load" });
    await page.waitForTimeout(400);
    await page.evaluate(() => window.__startAgentNavDemo());
    await page.waitForTimeout(durationMs);
    const video = page.video();
    await context.close();
    await browser.close();
    browser = undefined;

    if (!video) throw new Error("Playwright did not create a video.");
    const recordedPath = await video.path();
    await copyFile(recordedPath, outputWebm);
    await convertToMp4(outputWebm, outputMp4);

    log(`Wrote ${path.relative(rootDir, outputWebm)}`);
    log(`Wrote ${path.relative(rootDir, outputMp4)}`);
  } finally {
    if (browser) await browser.close().catch(() => undefined);
    if (server) server.kill("SIGTERM");
    await rm(tmpDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
