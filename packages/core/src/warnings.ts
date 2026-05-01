import { isConfirmationRisk } from "./normalize";
import type { AgentPageInput, AgentWarning } from "./types";

function pushUnique(warnings: AgentWarning[], warning: AgentWarning): void {
  if (!warnings.some((item) => item.code === warning.code && item.message === warning.message)) {
    warnings.push(warning);
  }
}

export function generateWarnings(page: AgentPageInput): AgentWarning[] {
  const warnings = [...page.warnings];

  if (!page.title?.trim()) {
    pushUnique(warnings, {
      severity: "high",
      code: "missing_page_title",
      message: "Page has no title.",
      fix: "Set a descriptive document title for agents and users."
    });
  }

  if (!page.description?.trim()) {
    pushUnique(warnings, {
      severity: "medium",
      code: "missing_meta_description",
      message: "Page has no meta description.",
      fix: "Add a concise description of the page purpose."
    });
  }

  if (!page.canonicalUrl) {
    pushUnique(warnings, {
      severity: "low",
      code: "missing_canonical_url",
      message: "Page has no canonical URL.",
      fix: "Add a canonical link so agents can identify the stable page URL."
    });
  }

  if (!page.jsonLd.some((entry) => "dateModified" in entry || "datePublished" in entry)) {
    pushUnique(warnings, {
      severity: "low",
      code: "missing_freshness_metadata",
      message: "No last-updated metadata found.",
      fix: "Expose dateModified or datePublished in structured data when the page changes over time."
    });
  }

  for (const action of page.actions) {
    if (isConfirmationRisk(action.risk) && !action.requiresUserConfirmation) {
      pushUnique(warnings, {
        severity: "high",
        code: "dangerous_action_without_confirmation",
        message: `${action.name} action uses risk "${action.risk}" but does not require user confirmation.`,
        fix: "Set requiresUserConfirmation to true and safe to false for sensitive actions."
      });
    }
  }

  const actionNameCounts = new Map<string, number>();
  for (const action of page.actions) {
    const key = action.name.trim().toLowerCase();
    actionNameCounts.set(key, (actionNameCounts.get(key) ?? 0) + 1);
  }
  for (const [name, count] of actionNameCounts) {
    if (count >= 3 && ["learn more", "view details", "submit", "click here"].includes(name)) {
      pushUnique(warnings, {
        severity: "medium",
        code: "duplicate_generic_action_labels",
        message: `Button text "${name}" appears ${count} times without unique labels.`,
        fix: "Add more specific labels or data-agent-action names for repeated CTAs."
      });
    }
  }

  for (const form of page.forms) {
    const personalFields = form.fields.filter((field) =>
      /email|phone|name|address|password|card|payment/i.test(`${field.name} ${field.type ?? ""}`)
    );
    if (personalFields.length > 0 && !form.requiresUserConfirmation) {
      pushUnique(warnings, {
        severity: "high",
        code: "personal_data_form_without_confirmation",
        message: `${form.name || form.id} collects personal data without confirmation metadata.`,
        fix: "Mark the form as requiring user confirmation and use risk shares_personal_data."
      });
    }

    if (!form.submitLabel) {
      pushUnique(warnings, {
        severity: "medium",
        code: "form_without_submit_label",
        message: `${form.name || form.id} has no detected submit button label.`,
        fix: "Add a clear submit button or data-agent-submit label."
      });
    }

    for (const field of form.fields) {
      if (field.required && !field.label) {
        pushUnique(warnings, {
          severity: "medium",
          code: "required_field_without_label",
          message: `Required field "${field.name}" has no machine-readable label.`,
          fix: "Use a label, aria-label, aria-labelledby, or data-agent-purpose."
        });
      }

      if (field.placeholder && field.label === field.placeholder) {
        pushUnique(warnings, {
          severity: "low",
          code: "placeholder_used_as_label",
          message: `Field "${field.name}" appears to use placeholder text as its only label.`,
          fix: "Add a persistent label so agents can identify the field even after typing."
        });
      }
    }
  }

  return warnings;
}
