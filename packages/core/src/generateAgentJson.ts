import type { AgentPageInput, AgentSiteConfig } from "./types";

export function generateAgentJson(config: AgentSiteConfig, _pages: AgentPageInput[] = []): Record<string, unknown> {
  return {
    version: "0.1",
    site: {
      name: config.siteName,
      domain: config.domain,
      purpose: config.purpose,
      language: config.language ?? "en"
    },
    agent_policy: {
      allowed: config.policies?.agentAllowed ?? [],
      requires_confirmation: config.policies?.requiresConfirmation ?? [],
      disallowed: config.policies?.disallowed ?? []
    },
    important_pages: config.importantPages ?? [],
    files: {
      llms: "/llms.txt",
      actions: "/.well-known/actions.json",
      sitemap: "/sitemap.xml"
    }
  };
}
