import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createJiti } from "jiti";
import { generateActionsJson, generateAgentJson, generateLlmsTxt, type AgentSiteConfig } from "@agentnav/core";

export async function loadConfig(cwd = process.cwd()): Promise<AgentSiteConfig> {
  const configPath = path.join(cwd, "agentnav.config.ts");
  const jiti = createJiti(import.meta.url);
  const loaded = await jiti.import<{ default?: AgentSiteConfig } & AgentSiteConfig>(configPath, { default: true });
  return (loaded.default ?? loaded) as AgentSiteConfig;
}

export async function buildStaticFiles(cwd = process.cwd()): Promise<string[]> {
  const config = await loadConfig(cwd);
  const publicDir = path.join(cwd, "public");
  const wellKnownDir = path.join(publicDir, ".well-known");

  await mkdir(wellKnownDir, { recursive: true });

  const files = [
    {
      path: path.join(publicDir, "llms.txt"),
      contents: generateLlmsTxt(config)
    },
    {
      path: path.join(wellKnownDir, "agent.json"),
      contents: `${JSON.stringify(generateAgentJson(config), null, 2)}\n`
    },
    {
      path: path.join(wellKnownDir, "actions.json"),
      contents: `${JSON.stringify(generateActionsJson(config), null, 2)}\n`
    }
  ];

  await Promise.all(files.map((file) => writeFile(file.path, file.contents, "utf8")));
  return files.map((file) => file.path);
}
