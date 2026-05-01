import { calculateScore, type AgentPage, type AgentWarning } from "@agentnav/core";
import { scanActions } from "./scanActions";
import { scanEntities } from "./scanEntities";
import { scanForms } from "./scanForms";
import { scanJsonLd } from "./scanJsonLd";
import { scanCanonicalUrl, scanMetaDescription, scanMetaTitle } from "./scanMeta";
import { scanNavigation } from "./scanNavigation";

export function scanCurrentPage(): AgentPage {
  const warnings: AgentWarning[] = [];
  const jsonLd = scanJsonLd(warnings);
  const description = scanMetaDescription();
  const language = document.documentElement.lang || undefined;
  const canonicalUrl = scanCanonicalUrl();
  const pageWithoutScore = {
    url: window.location.href,
    title: scanMetaTitle(),
    ...(description ? { description } : {}),
    ...(language ? { language } : {}),
    ...(canonicalUrl ? { canonicalUrl } : {}),
    entities: scanEntities(jsonLd),
    actions: scanActions(),
    forms: scanForms(warnings),
    navigation: scanNavigation(),
    jsonLd,
    warnings
  };
  const score = calculateScore(pageWithoutScore);

  return {
    ...pageWithoutScore,
    warnings: score.warnings,
    score
  };
}
