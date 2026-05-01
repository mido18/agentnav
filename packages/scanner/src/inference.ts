import type { AgentAction, AgentRisk } from "@agentnav/core";

export function cleanText(text: string | null | undefined): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

export function inferActionType(text: string, element?: Element): AgentAction["type"] {
  const value = cleanText(text).toLowerCase();
  const combined = `${value} ${element?.getAttribute("data-agent-purpose") ?? ""}`.toLowerCase();

  if (/book|schedule|appointment|viewing|reserve/.test(combined)) return "book";
  if (/buy|checkout|pay|purchase|subscribe/.test(combined)) return "buy";
  if (/contact|call|email|sales|enquire|inquire|lead/.test(combined)) return "contact";
  if (/download|brochure|pdf/.test(combined)) return "download";
  if (/search|filter|find/.test(combined)) return "search";
  if (/compare/.test(combined)) return "compare";
  if (/cancel|delete|remove|unsubscribe/.test(combined)) return "cancel";
  if (element instanceof HTMLButtonElement && element.type === "submit") return "submit_form";
  return "navigate";
}

export function inferRiskFromText(text: string, type: AgentAction["type"]): AgentRisk {
  const value = cleanText(text).toLowerCase();
  if (type === "book" || /appointment|viewing|reserve/.test(value)) return "booking";
  if (type === "buy" || /pay|payment|checkout|card|purchase/.test(value)) return "payment";
  if (type === "contact" || type === "submit_form" || /phone|email|contact|lead|inquire|enquire/.test(value)) {
    return "shares_personal_data";
  }
  if (type === "cancel" || /delete|remove|unsubscribe|cancel/.test(value)) return "destructive";
  return "none";
}

export function confidenceForSource(source: AgentAction["source"]): number {
  if (source === "explicit" || source === "config") return 1;
  if (source === "form") return 0.9;
  if (source === "button") return 0.72;
  if (source === "link") return 0.68;
  return 0.55;
}

export function hasCtaText(text: string): boolean {
  return /book|buy|contact|download|search|compare|cancel|subscribe|submit|view|learn|get started|request|schedule|call|email/i.test(
    text
  );
}

export function normalizeId(text: string, fallback: string): string {
  const id = cleanText(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
  return id || fallback;
}

export function inferFormRisk(form: HTMLFormElement): AgentRisk {
  const text = `${form.getAttribute("data-agent-risk") ?? ""} ${form.textContent ?? ""} ${[...form.elements]
    .map((element) => {
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
        return `${element.name} ${element.type} ${element.autocomplete}`;
      }
      return "";
    })
    .join(" ")}`.toLowerCase();

  if (/card|payment|billing|cvv|checkout/.test(text)) return "payment";
  if (/book|appointment|viewing|schedule/.test(text)) return "booking";
  if (/password|account|profile/.test(text)) return "account_change";
  if (/medical|health/.test(text)) return "medical";
  if (/legal|government|tax/.test(text)) return "legal";
  if (/delete|cancel|remove/.test(text)) return "destructive";
  if (/email|phone|name|address|contact/.test(text)) return "shares_personal_data";
  return "none";
}
