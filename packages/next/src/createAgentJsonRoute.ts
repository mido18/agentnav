import { generateAgentJson, type AgentPageInput, type AgentSiteConfig } from "@agentnav/core";

export function createAgentJsonRoute(config: AgentSiteConfig, pages: AgentPageInput[] = []) {
  return function GET(): Response {
    return Response.json(generateAgentJson(config, pages), {
      headers: {
        "cache-control": "public, max-age=300"
      }
    });
  };
}
