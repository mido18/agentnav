import { generateLlmsTxt, type AgentPageInput, type AgentSiteConfig } from "@agentnav/core";

export function createLlmsTxtRoute(config: AgentSiteConfig, pages: AgentPageInput[] = []) {
  return function GET(): Response {
    return new Response(generateLlmsTxt(config, pages), {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=300"
      }
    });
  };
}
