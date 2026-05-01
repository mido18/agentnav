import type { AgentWarning } from "@agentnav/core";

function asRecords(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(asRecords);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record["@graph"])) {
      return [record, ...record["@graph"].flatMap(asRecords)];
    }
    return [record];
  }
  return [];
}

export function scanJsonLd(warnings: AgentWarning[] = []): Record<string, unknown>[] {
  const output: Record<string, unknown>[] = [];
  const scripts = document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]');

  scripts.forEach((script, index) => {
    const text = script.textContent?.trim();
    if (!text) return;

    try {
      output.push(...asRecords(JSON.parse(text)));
    } catch {
      warnings.push({
        severity: "medium",
        code: "invalid_json_ld",
        message: `JSON-LD script ${index + 1} could not be parsed.`,
        fix: "Validate the script content as strict JSON."
      });
    }
  });

  return output;
}
