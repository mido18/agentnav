import { AgentSiteConfigSchema, type AgentSiteConfig } from "@agentnav/core";

export function defineAgentNavConfig(config: AgentSiteConfig): AgentSiteConfig {
  return AgentSiteConfigSchema.parse(config) as AgentSiteConfig;
}
