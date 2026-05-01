import { formToAction, normalizeAction } from "./normalize";
import type { AgentPageInput, AgentSiteConfig } from "./types";

export function generateLlmsTxt(config: AgentSiteConfig, pages: AgentPageInput[] = []): string {
  const importantPages = config.importantPages ?? [];
  const actions = [
    ...(config.actions ?? []),
    ...pages.flatMap((page) => page.actions),
    ...pages.flatMap((page) => page.forms.map(formToAction))
  ].map(normalizeAction);

  const lines = [
    `# ${config.siteName}`,
    "",
    `${config.siteName} is ${config.purpose}.`,
    "",
    "## Important Pages",
    ""
  ];

  if (importantPages.length === 0) {
    lines.push("- No important pages have been configured yet.");
  } else {
    for (const page of importantPages) {
      lines.push(`- [${page.title}](${page.url}): ${page.description || page.intent || "Important page."}`);
    }
  }

  lines.push(
    "",
    "## Agent Guidance",
    "",
    "Agents may help users browse, compare, summarize, and prepare forms.",
    "",
    "Agents must request user confirmation before submitting personal data, booking appointments, making payments, canceling services, deleting data, changing accounts, or submitting legal, medical, or financial information.",
    ""
  );

  const allowed = config.policies?.agentAllowed ?? [];
  if (allowed.length > 0) {
    lines.push("Allowed agent tasks:", "", ...allowed.map((item) => `- ${item}`), "");
  }

  const requiresConfirmation = config.policies?.requiresConfirmation ?? [];
  if (requiresConfirmation.length > 0) {
    lines.push("Confirmation required for:", "", ...requiresConfirmation.map((item) => `- ${item}`), "");
  }

  const disallowed = config.policies?.disallowed ?? [];
  if (disallowed.length > 0) {
    lines.push("Disallowed actions:", "", ...disallowed.map((item) => `- ${item}`), "");
  }

  lines.push("## Actions", "");

  if (actions.length === 0) {
    lines.push("- No public actions have been configured yet.");
  } else {
    const seen = new Set<string>();
    for (const action of actions) {
      if (seen.has(action.id)) continue;
      seen.add(action.id);
      const status = action.requiresUserConfirmation ? "Requires user confirmation." : action.safe ? "Safe." : "Not marked safe.";
      lines.push(`- ${action.id}: ${action.description || action.name}. ${status}`);
    }
  }

  return `${lines.join("\n")}\n`;
}
