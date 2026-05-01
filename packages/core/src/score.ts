import { generateWarnings } from "./warnings";
import type { AgentPageInput, AgentReadinessScore } from "./types";
import { isConfirmationRisk } from "./normalize";

function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(max, Math.round(value)));
}

function grade(score: number): AgentReadinessScore["grade"] {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

export function calculateScore(page: AgentPageInput): AgentReadinessScore {
  const warnings = generateWarnings(page);

  const pageIdentity = clamp(
    (page.title ? 4 : 0) +
      (page.description ? 3 : 0) +
      (page.canonicalUrl ? 2 : 0) +
      (page.language ? 1 : 0),
    10
  );

  const navigation = clamp(
    Math.min(page.navigation.length, 5) * 2 +
      (page.navigation.some((link) => link.purpose) ? 3 : 0) +
      (page.navigation.length >= 3 ? 2 : 0),
    15
  );

  const explicitEntities = page.entities.filter((entity) => entity.source === "explicit").length;
  const entityConfidence = page.entities.reduce((total, entity) => total + entity.confidence, 0);
  const entities = clamp(Math.min(page.entities.length, 3) * 3 + explicitEntities * 2 + entityConfidence, 15);

  const explicitActions = page.actions.filter((action) => action.source === "explicit" || action.source === "config").length;
  const clearActions = page.actions.filter((action) => action.type !== "unknown" && action.confidence >= 0.7).length;
  const actions = clamp(Math.min(page.actions.length, 4) * 3 + explicitActions * 3 + clearActions, 20);

  const forms =
    page.forms.length === 0
      ? 12
      : clamp(
          page.forms.reduce((total, form) => {
            const labeledFields = form.fields.filter((field) => field.label).length;
            const labelRatio = form.fields.length === 0 ? 1 : labeledFields / form.fields.length;
            return total + 5 + labelRatio * 6 + (form.submitLabel ? 2 : 0) + (form.requiresUserConfirmation ? 2 : 0);
          }, 0) / page.forms.length,
          15
        );

  const structuredData = clamp(
    page.jsonLd.length > 0 ? 5 + Math.min(page.jsonLd.length, 3) * 1.5 + (page.entities.some((e) => e.source === "jsonld") ? 1 : 0) : 0,
    10
  );

  const riskyActions = page.actions.filter((action) => isConfirmationRisk(action.risk));
  const unsafeCorrectlyMarked = riskyActions.filter((action) => !action.safe && action.requiresUserConfirmation).length;
  const riskyForms = page.forms.filter((form) => isConfirmationRisk(form.risk));
  const confirmedRiskyForms = riskyForms.filter((form) => form.requiresUserConfirmation).length;
  const safety =
    riskyActions.length + riskyForms.length === 0
      ? 10
      : clamp(
          ((unsafeCorrectlyMarked + confirmedRiskyForms) / (riskyActions.length + riskyForms.length)) * 10,
          10
        );

  const freshness = clamp(
    page.jsonLd.some((entry) => "dateModified" in entry) ? 5 : page.jsonLd.some((entry) => "datePublished" in entry) ? 4 : 2,
    5
  );

  const warningPenalty = warnings.reduce((penalty, warning) => {
    if (warning.severity === "high") return penalty + 6;
    if (warning.severity === "medium") return penalty + 3;
    return penalty + 1;
  }, 0);

  const rawScore =
    pageIdentity + navigation + entities + actions + forms + structuredData + safety + freshness - Math.min(warningPenalty, 20);
  const score = clamp(rawScore, 100);

  return {
    score,
    grade: grade(score),
    breakdown: {
      pageIdentity,
      navigation,
      entities,
      actions,
      forms,
      structuredData,
      safety,
      freshness
    },
    warnings
  };
}
