import { generateActionsJson, type AgentPageInput, type AgentSiteConfig } from "@agentnav/core";

export function createActionsJsonRoute(config: AgentSiteConfig, pages: AgentPageInput[] = []) {
  return function GET(): Response {
    return Response.json(generateActionsJson(config, pages), {
      headers: {
        "cache-control": "public, max-age=300"
      }
    });
  };
}
