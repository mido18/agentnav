import { formToAction, normalizeAction } from "./normalize";
import type { AgentAction, AgentPageInput, AgentSiteConfig } from "./types";

function shouldPublishScannedAction(action: AgentAction): boolean {
  if (action.source === "explicit" || action.source === "config" || action.source === "form") return true;
  return action.confidence >= 0.85;
}

export function collectPublishableActions(config: AgentSiteConfig, pages: AgentPageInput[] = []): AgentAction[] {
  const actions = [
    ...(config.actions ?? []),
    ...pages.flatMap((page) => page.actions.filter(shouldPublishScannedAction)),
    ...pages.flatMap((page) => page.forms.map(formToAction))
  ].map(normalizeAction);

  const byId = new Map<string, AgentAction>();
  for (const action of actions) {
    if (!byId.has(action.id)) byId.set(action.id, action);
  }

  return [...byId.values()];
}

export function generateActionsJson(config: AgentSiteConfig, pages: AgentPageInput[] = []): Record<string, unknown> {
  return {
    version: "0.1",
    site: config.siteName,
    actions: collectPublishableActions(config, pages)
  };
}
