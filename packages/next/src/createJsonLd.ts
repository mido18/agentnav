import { generateJsonLd, type AgentPageInput, type AgentSiteConfig } from "@agentnav/core";

export function createJsonLd(config: AgentSiteConfig, page?: AgentPageInput): Record<string, unknown>[] {
  return generateJsonLd(config, page);
}
