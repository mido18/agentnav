import type { AgentPage, AgentWarning } from "@agentnav/core";
import { scanUrl } from "./scan";

function warningWeight(warning: AgentWarning): number {
  if (warning.severity === "high") return 0;
  if (warning.severity === "medium") return 1;
  return 2;
}

export function formatScoreOutput(page: AgentPage): string {
  const warnings = [...page.score.warnings].sort((a, b) => warningWeight(a) - warningWeight(b));
  const lines = [`Agent Readiness Score: ${page.score.score}/100 — ${page.score.grade}`, ""];

  if (warnings.length === 0) {
    lines.push("High priority fixes:", "None.");
  } else {
    lines.push("High priority fixes:");
    warnings.slice(0, 5).forEach((warning, index) => {
      lines.push(`${index + 1}. ${warning.message}`);
    });
  }

  return lines.join("\n");
}

export async function scoreUrl(url: string): Promise<string> {
  const page = await scanUrl(url);
  return formatScoreOutput(page);
}
