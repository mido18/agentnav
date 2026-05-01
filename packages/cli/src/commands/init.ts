import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

async function writeIfMissing(filePath: string, contents: string): Promise<boolean> {
  if (existsSync(filePath)) return false;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents, "utf8");
  return true;
}

export async function initProject(cwd = process.cwd()): Promise<string[]> {
  const created: string[] = [];
  const files = [
    {
      path: path.join(cwd, "agentnav.config.ts"),
      contents: `import { defineAgentNavConfig } from "@agentnav/next";

export default defineAgentNavConfig({
  siteName: "My Site",
  domain: "https://example.com",
  purpose: "Website prepared for AI agents",
  language: "en",
  policies: {
    agentAllowed: ["read_content", "prepare_forms"],
    requiresConfirmation: ["submit_personal_data"],
    disallowed: ["make_payment_without_user_confirmation"]
  },
  actions: []
});
`
    },
    {
      path: path.join(cwd, "app/llms.txt/route.ts"),
      contents: `import config from "../../agentnav.config";
import { createLlmsTxtRoute } from "@agentnav/next";

export const GET = createLlmsTxtRoute(config);
`
    },
    {
      path: path.join(cwd, "app/.well-known/agent.json/route.ts"),
      contents: `import config from "../../../agentnav.config";
import { createAgentJsonRoute } from "@agentnav/next";

export const GET = createAgentJsonRoute(config);
`
    },
    {
      path: path.join(cwd, "app/.well-known/actions.json/route.ts"),
      contents: `import config from "../../../agentnav.config";
import { createActionsJsonRoute } from "@agentnav/next";

export const GET = createActionsJsonRoute(config);
`
    }
  ];

  for (const file of files) {
    if (await writeIfMissing(file.path, file.contents)) created.push(file.path);
  }

  return created;
}
