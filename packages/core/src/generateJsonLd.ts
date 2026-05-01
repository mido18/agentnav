import type { AgentEntity, AgentPageInput, AgentSiteConfig } from "./types";

function compactObject(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === "object" && !Array.isArray(value) && Object.keys(value as Record<string, unknown>).length === 0) {
        return false;
      }
      return true;
    })
  );
}

function entityToJsonLd(entity: AgentEntity): Record<string, unknown> | null {
  const fields = entity.fields ?? {};

  if (entity.type === "article") {
    return compactObject({
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": entity.url || entity.id,
      headline: entity.name,
      description: entity.description,
      url: entity.url
    });
  }

  if (entity.type === "faq") {
    const questions = Array.isArray(fields.questions) ? fields.questions : [];
    return compactObject({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": entity.url || entity.id,
      mainEntity: questions
    });
  }

  if (entity.type === "event") {
    return compactObject({
      "@context": "https://schema.org",
      "@type": "Event",
      "@id": entity.url || entity.id,
      name: entity.name,
      description: entity.description,
      url: entity.url,
      startDate: fields.startDate,
      endDate: fields.endDate
    });
  }

  if (entity.type === "organization" || entity.type === "person") {
    return compactObject({
      "@context": "https://schema.org",
      "@type": entity.type === "organization" ? "Organization" : "Person",
      "@id": entity.url || entity.id,
      name: entity.name,
      description: entity.description,
      url: entity.url
    });
  }

  if (entity.type === "product" || entity.type === "service" || entity.type === "real_estate_unit") {
    const price = fields.price;
    const currency = fields.currency;
    const offers =
      price !== undefined
        ? compactObject({
            "@type": "Offer",
            price,
            priceCurrency: currency,
            availability: fields.availability
          })
        : undefined;

    return compactObject({
      "@context": "https://schema.org",
      "@type": entity.type === "service" ? "Service" : "Product",
      "@id": entity.url || entity.id,
      name: entity.name,
      description: entity.description,
      url: entity.url,
      offers,
      additionalProperty: Object.entries(fields)
        .filter(([key]) => !["price", "currency", "availability"].includes(key))
        .map(([name, value]) => ({
          "@type": "PropertyValue",
          name,
          value
        }))
    });
  }

  return null;
}

export function generateJsonLd(config: AgentSiteConfig, page?: AgentPageInput): Record<string, unknown>[] {
  const output: Record<string, unknown>[] = [
    compactObject({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: config.siteName,
      url: config.domain,
      description: config.purpose,
      inLanguage: config.language
    })
  ];

  if (config.business) {
    output.push(
      compactObject({
        "@context": "https://schema.org",
        "@type": config.business.address ? "LocalBusiness" : "Organization",
        name: config.business.name || config.siteName,
        url: config.domain,
        telephone: config.business.phone,
        email: config.business.email,
        address: config.business.address,
        sameAs: config.business.sameAs
      })
    );
  }

  if (page) {
    for (const entity of page.entities) {
      if (entity.source === "heuristic" && entity.confidence < 0.85) continue;
      const item = entityToJsonLd(entity);
      if (item) output.push(item);
    }
  }

  return output;
}
