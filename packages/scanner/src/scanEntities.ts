import type { AgentEntity } from "@agentnav/core";
import { cleanText, normalizeId } from "./inference";
import { scanJsonLd } from "./scanJsonLd";

const jsonLdTypeMap: Record<string, AgentEntity["type"]> = {
  Product: "product",
  Service: "service",
  Article: "article",
  NewsArticle: "article",
  BlogPosting: "article",
  Organization: "organization",
  LocalBusiness: "organization",
  Person: "person",
  Event: "event",
  FAQPage: "faq"
};

function readAgentFields(element: Element): Record<string, unknown> | undefined {
  const fields: Record<string, unknown> = {};
  const fieldElements = element.querySelectorAll<HTMLElement>("[data-agent-field]");

  for (const field of fieldElements) {
    const name = field.getAttribute("data-agent-field");
    if (!name) continue;
    const value = field.getAttribute("data-agent-value") ?? cleanText(field.textContent);
    fields[name] = value;

    const currency = field.getAttribute("data-agent-currency");
    if (currency) fields.currency = currency;
  }

  return Object.keys(fields).length > 0 ? fields : undefined;
}

export function scanEntities(jsonLd: Record<string, unknown>[] = scanJsonLd()): AgentEntity[] {
  const entities: AgentEntity[] = [];
  const seen = new Set<string>();

  document.querySelectorAll<HTMLElement>("[data-agent-entity]").forEach((element, index) => {
    const type = (element.getAttribute("data-agent-entity") || "unknown") as AgentEntity["type"];
    const id = element.getAttribute("data-agent-id") || normalizeId(element.getAttribute("data-agent-name") || "", `entity_${index + 1}`);
    const name =
      element.getAttribute("data-agent-name") ||
      cleanText(element.querySelector("h1, h2, h3, [data-agent-field='name']")?.textContent);
    const description =
      element.getAttribute("data-agent-description") ||
      cleanText(element.querySelector("[data-agent-field='description'], p")?.textContent);

    seen.add(id);
    const fields = readAgentFields(element);
    entities.push({
      id,
      type,
      ...(name ? { name } : {}),
      ...(description ? { description } : {}),
      ...(fields ? { fields } : {}),
      confidence: 1,
      source: "explicit"
    });
  });

  jsonLd.forEach((entry, index) => {
    const rawType = Array.isArray(entry["@type"]) ? String(entry["@type"][0]) : String(entry["@type"] ?? "");
    const type = jsonLdTypeMap[rawType] ?? "unknown";
    if (type === "unknown") return;
    const id = String(entry["@id"] || entry.url || normalizeId(String(entry.name ?? rawType), `jsonld_${index + 1}`));
    if (seen.has(id)) return;
    seen.add(id);
    entities.push({
      id,
      type,
      ...(typeof entry.name === "string" ? { name: entry.name } : {}),
      ...(typeof entry.description === "string" ? { description: entry.description } : {}),
      ...(typeof entry.url === "string" ? { url: entry.url } : {}),
      confidence: 0.92,
      source: "jsonld"
    });
  });

  document.querySelectorAll<HTMLElement>("article").forEach((article, index) => {
    const name = cleanText(article.querySelector("h1, h2")?.textContent);
    if (!name) return;
    const id = normalizeId(name, `article_${index + 1}`);
    if (seen.has(id)) return;
    seen.add(id);
    const description = cleanText(article.querySelector("p")?.textContent);
    entities.push({
      id,
      type: "article",
      name,
      ...(description ? { description } : {}),
      confidence: 0.72,
      source: "semantic_html"
    });
  });

  document.querySelectorAll<HTMLElement>("[class*='card' i], [data-card], li").forEach((card, index) => {
    if (card.closest("[data-agent-entity]")) return;
    const heading = cleanText(card.querySelector("h2, h3, h4")?.textContent);
    const text = cleanText(card.textContent);
    const priceMatch = text.match(/(?:EGP|USD|EUR|\$|€|£)\s?[0-9][0-9,]*(?:\.\d+)?|[0-9][0-9,]*(?:\.\d+)?\s?(?:EGP|USD|EUR)/i);
    if (!heading || !priceMatch) return;
    const id = normalizeId(heading, `listing_${index + 1}`);
    if (seen.has(id)) return;
    seen.add(id);
    entities.push({
      id,
      type: "product",
      name: heading,
      fields: {
        priceText: priceMatch[0]
      },
      confidence: 0.62,
      source: "heuristic"
    });
  });

  const faqQuestions = [...document.querySelectorAll<HTMLElement>("[itemprop='mainEntity'], details, [data-faq-item]")]
    .map((item) => cleanText(item.querySelector("summary, h2, h3, [itemprop='name']")?.textContent))
    .filter(Boolean);
  if (faqQuestions.length >= 2 && !seen.has("faq")) {
    entities.push({
      id: "faq",
      type: "faq",
      name: "FAQ",
      fields: {
        questions: faqQuestions.map((question) => ({
          "@type": "Question",
          name: question
        }))
      },
      confidence: 0.68,
      source: "heuristic"
    });
  }

  return entities;
}
