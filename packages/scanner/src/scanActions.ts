import { normalizeAction, type AgentAction } from "@agentnav/core";
import { domPath } from "./domPath";
import { cleanText, confidenceForSource, hasCtaText, inferActionType, inferRiskFromText, normalizeId } from "./inference";

function boolAttr(element: Element, name: string): boolean | undefined {
  const value = element.getAttribute(name);
  if (value === null) return undefined;
  return value === "" || value === "true";
}

function actionFromElement(element: HTMLElement, source: AgentAction["source"], index: number): AgentAction | null {
  const text = cleanText(
    element.getAttribute("data-agent-name") ||
      element.getAttribute("aria-label") ||
      element.getAttribute("title") ||
      element.textContent
  );
  if (!text && !element.getAttribute("data-agent-action")) return null;

  const explicitId = element.getAttribute("data-agent-action");
  const type = (element.getAttribute("data-agent-action-type") as AgentAction["type"] | null) || inferActionType(text, element);
  const risk = (element.getAttribute("data-agent-risk") as AgentAction["risk"] | null) || inferRiskFromText(text, type);
  const endpoint = element instanceof HTMLAnchorElement ? element.href : element.getAttribute("formaction") || undefined;
  const method =
    element instanceof HTMLButtonElement && element.form?.method
      ? (element.form.method.toUpperCase() as AgentAction["method"])
      : element instanceof HTMLAnchorElement
        ? "GET"
        : undefined;
  const requiresUserConfirmation = boolAttr(element, "data-agent-requires-confirmation") ?? risk !== "none";

  return normalizeAction({
    id: explicitId || normalizeId(text, `action_${index + 1}`),
    name: text || explicitId || `Action ${index + 1}`,
    type,
    ...(method ? { method } : {}),
    ...(endpoint ? { endpoint } : {}),
    elementPath: domPath(element),
    safe: risk === "none" && type !== "submit_form",
    requiresUserConfirmation,
    risk,
    confidence: confidenceForSource(source),
    source
  });
}

export function scanActions(): AgentAction[] {
  const actions: AgentAction[] = [];
  const seen = new Set<string>();

  const explicit = [...document.querySelectorAll<HTMLElement>("[data-agent-action]")];
  explicit.forEach((element, index) => {
    const action = actionFromElement(element, "explicit", index);
    if (!action) return;
    seen.add(action.elementPath || action.id);
    actions.push(action);
  });

  const candidates = [
    ...document.querySelectorAll<HTMLElement>("button, input[type='submit'], input[type='button'], [role='button'], a[href]")
  ];

  candidates.forEach((element, index) => {
    if (element.hasAttribute("data-agent-action")) return;
    const text =
      element instanceof HTMLInputElement
        ? cleanText(element.value || element.getAttribute("aria-label"))
        : cleanText(element.getAttribute("aria-label") || element.textContent);
    if (!text || !hasCtaText(text)) return;
    const source: AgentAction["source"] = element instanceof HTMLAnchorElement ? "link" : "button";
    const action = actionFromElement(element, source, index + explicit.length);
    if (!action) return;
    const key = action.elementPath || action.id;
    if (seen.has(key)) return;
    seen.add(key);
    actions.push(action);
  });

  return actions;
}
