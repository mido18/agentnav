import { isConfirmationRisk, type AgentForm, type AgentFormField, type AgentWarning } from "@agentnav/core";
import { cleanText, inferFormRisk, normalizeId } from "./inference";

function escapeCssIdentifier(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value);
  return value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function byId(id: string | null): HTMLElement | null {
  return id ? document.getElementById(id) : null;
}

export function resolveFieldLabel(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): {
  label?: string;
  usedPlaceholder: boolean;
} {
  const explicit = field.id
    ? document.querySelector<HTMLLabelElement>(`label[for="${escapeCssIdentifier(field.id)}"]`)
    : null;
  const wrapping = field.closest("label");
  const ariaLabel = field.getAttribute("aria-label");
  const ariaLabelledBy = field
    .getAttribute("aria-labelledby")
    ?.split(/\s+/)
    .map((id) => cleanText(byId(id)?.textContent))
    .filter(Boolean)
    .join(" ");
  const name = field.name || field.id;
  const placeholder = field.getAttribute("placeholder") || undefined;
  const label = cleanText(
    explicit?.textContent ||
      wrapping?.textContent?.replace(field.value, "") ||
      ariaLabel ||
      ariaLabelledBy ||
      name ||
      placeholder
  );

  return {
    ...(label ? { label } : {}),
    usedPlaceholder: Boolean(!explicit && !wrapping && !ariaLabel && !ariaLabelledBy && !name && placeholder)
  };
}

function fieldFromElement(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): AgentFormField | null {
  if (field instanceof HTMLInputElement && ["submit", "button", "reset", "hidden"].includes(field.type)) return null;
  const name = field.name || field.id;
  if (!name) return null;

  const { label, usedPlaceholder } = resolveFieldLabel(field);
  const placeholder = field.getAttribute("placeholder") || undefined;
  const agentPurpose = field.getAttribute("data-agent-purpose") || undefined;
  const options =
    field instanceof HTMLSelectElement
      ? [...field.options].map((option) => cleanText(option.textContent || option.value)).filter(Boolean)
      : undefined;

  const output: AgentFormField = {
    name,
    type: field instanceof HTMLInputElement ? field.type : field.tagName.toLowerCase(),
    required: field.required || field.getAttribute("aria-required") === "true",
    confidence: usedPlaceholder ? 0.55 : label ? 0.85 : 0.45
  };

  if (label) output.label = label;
  if (placeholder) output.placeholder = placeholder;
  if (field instanceof HTMLInputElement && field.autocomplete) output.autocomplete = field.autocomplete;
  if (field instanceof HTMLInputElement && field.pattern) output.pattern = field.pattern;
  if (field instanceof HTMLInputElement && field.min) output.min = field.min;
  if (field instanceof HTMLInputElement && field.max) output.max = field.max;
  if (options && options.length > 0) output.options = options;
  if (agentPurpose) output.agentPurpose = agentPurpose;

  return output;
}

function findSubmitLabel(form: HTMLFormElement): string | undefined {
  const submit = form.querySelector<HTMLButtonElement | HTMLInputElement>(
    "button[type='submit'], button:not([type]), input[type='submit']"
  );
  if (!submit) return undefined;
  if (submit instanceof HTMLInputElement) return cleanText(submit.value) || undefined;
  return cleanText(submit.textContent || submit.getAttribute("aria-label")) || undefined;
}

export function scanForms(warnings: AgentWarning[] = []): AgentForm[] {
  return [...document.forms].map((form, index) => {
    const fields = [...form.elements]
      .filter(
        (element): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
          element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement
      )
      .map(fieldFromElement)
      .filter((field): field is AgentFormField => Boolean(field));

    const submitLabel = findSubmitLabel(form);
    const risk = (form.getAttribute("data-agent-risk") as AgentForm["risk"] | null) || inferFormRisk(form);
    const requiresUserConfirmation =
      form.getAttribute("data-agent-requires-confirmation") === "true" || isConfirmationRisk(risk);
    const id = form.getAttribute("data-agent-form") || form.id || form.name || normalizeId(submitLabel || "", `form_${index + 1}`);

    for (const field of fields) {
      if (field.required && !field.label) {
        warnings.push({
          severity: "medium",
          code: "required_field_without_label",
          message: `Required field "${field.name}" has no machine-readable label.`,
          fix: "Use a label, aria-label, aria-labelledby, or data-agent-purpose."
        });
      }
      if (field.placeholder && field.label === field.placeholder) {
        warnings.push({
          severity: "low",
          code: "placeholder_used_as_label",
          message: `Field "${field.name}" appears to use placeholder text as its only label.`,
          fix: "Add a persistent label so agents can identify the field even after typing."
        });
      }
    }

    if (!submitLabel) {
      warnings.push({
        severity: "medium",
        code: "form_without_submit_label",
        message: `${id} has no detected submit button label.`,
        fix: "Add a clear submit button or data-agent-submit label."
      });
    }

    const formName = form.getAttribute("name") || undefined;
    const action = form.getAttribute("action") ? form.action : undefined;
    const output: AgentForm = {
      id,
      method: (form.getAttribute("method") || "GET").toUpperCase(),
      fields,
      requiresUserConfirmation,
      risk,
      confidence: form.hasAttribute("data-agent-form") ? 1 : 0.82
    };
    if (formName) output.name = formName;
    if (action) output.action = action;
    if (submitLabel) output.submitLabel = submitLabel;
    return output;
  });
}
