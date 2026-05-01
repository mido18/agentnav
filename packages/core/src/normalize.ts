import type { AgentAction, AgentForm, AgentRisk } from "./types";

export const confirmationRisks: ReadonlySet<AgentRisk> = new Set([
  "shares_personal_data",
  "booking",
  "payment",
  "account_change",
  "legal",
  "medical",
  "destructive"
]);

export function isConfirmationRisk(risk: AgentRisk): boolean {
  return confirmationRisks.has(risk);
}

export function inferRiskFromAction(action: Pick<AgentAction, "type" | "method" | "risk">): AgentRisk {
  if (action.risk && action.risk !== "unknown") return action.risk;
  if (action.type === "book") return "booking";
  if (action.type === "buy") return "payment";
  if (action.type === "contact" || action.type === "submit_form") return "shares_personal_data";
  if (action.type === "cancel") return "destructive";
  if (action.method === "DELETE") return "destructive";
  return action.risk ?? "unknown";
}

export function normalizeAction(action: AgentAction): AgentAction {
  const risk = inferRiskFromAction(action);
  const forcedConfirmation = isConfirmationRisk(risk);
  const requiresUserConfirmation = action.requiresUserConfirmation || forcedConfirmation;
  return {
    ...action,
    risk,
    requiresUserConfirmation,
    safe: forcedConfirmation ? false : action.safe
  };
}

export function actionIdFromText(text: string, fallback = "action"): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
  return slug || fallback;
}

export function formToAction(form: AgentForm): AgentAction {
  const name = form.submitLabel || form.name || `Submit ${form.id}`;
  const method = form.method.toUpperCase();
  const action: AgentAction = {
    id: form.id,
    name,
    type: "submit_form",
    ...(method === "GET" || method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE"
      ? { method }
      : {}),
    ...(form.action ? { endpoint: form.action } : {}),
    inputSchema: {
      type: "object",
      required: form.fields.filter((field) => field.required).map((field) => field.name),
      properties: Object.fromEntries(
        form.fields.map((field) => [
          field.name,
          {
            type: field.type === "number" ? "number" : "string",
            description: field.label || field.agentPurpose || field.placeholder
          }
        ])
      )
    },
    safe: false,
    requiresUserConfirmation: form.requiresUserConfirmation,
    risk: form.risk,
    confidence: form.confidence,
    source: "form"
  };

  return normalizeAction({
    ...action
  });
}
