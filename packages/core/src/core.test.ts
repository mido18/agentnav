import { describe, expect, it } from "vitest";
import {
  AgentActionSchema,
  AgentSiteConfigSchema,
  calculateScore,
  generateActionsJson,
  generateAgentJson,
  generateJsonLd,
  generateLlmsTxt,
  normalizeAction,
  type AgentPageInput,
  type AgentSiteConfig
} from "./index";

const config: AgentSiteConfig = {
  siteName: "Hyde Park",
  domain: "https://example.com",
  purpose: "a real estate website for browsing units",
  language: "en",
  importantPages: [{ title: "Available Units", url: "/units", description: "Search units." }],
  policies: {
    agentAllowed: ["read_content"],
    requiresConfirmation: ["book_viewing"],
    disallowed: ["pay_without_confirmation"]
  },
  actions: [
    {
      id: "book_viewing",
      name: "Book viewing",
      type: "book",
      method: "POST",
      endpoint: "/api/book",
      safe: false,
      requiresUserConfirmation: true,
      risk: "booking",
      confidence: 1,
      source: "config"
    }
  ]
};

const page: AgentPageInput = {
  url: "https://example.com/units",
  title: "Available Units",
  description: "Search units.",
  language: "en",
  canonicalUrl: "https://example.com/units",
  entities: [
    {
      id: "villa-a",
      type: "real_estate_unit",
      name: "Villa Type A",
      fields: { price: 12500000, currency: "EGP", bedrooms: 4 },
      confidence: 1,
      source: "explicit"
    }
  ],
  actions: [
    {
      id: "book_viewing_villa_a",
      name: "Book Viewing",
      type: "book",
      safe: false,
      requiresUserConfirmation: true,
      risk: "booking",
      confidence: 1,
      source: "explicit"
    }
  ],
  forms: [],
  navigation: [{ text: "Units", href: "https://example.com/units", purpose: "browse units", confidence: 0.9 }],
  jsonLd: [{ "@type": "WebSite", name: "Hyde Park", dateModified: "2026-05-01" }],
  warnings: []
};

describe("@agentnav/core", () => {
  it("validates core schemas", () => {
    expect(() => AgentSiteConfigSchema.parse(config)).not.toThrow();
    expect(() => AgentActionSchema.parse(config.actions?.[0])).not.toThrow();
    expect(() => AgentActionSchema.parse({ id: "", type: "book" })).toThrow();
  });

  it("forces dangerous actions to require confirmation", () => {
    const action = normalizeAction({
      id: "pay",
      name: "Pay now",
      type: "buy",
      safe: true,
      requiresUserConfirmation: false,
      risk: "unknown",
      confidence: 0.8,
      source: "button"
    });

    expect(action.safe).toBe(false);
    expect(action.requiresUserConfirmation).toBe(true);
    expect(action.risk).toBe("payment");
  });

  it("calculates a readiness score and warnings", () => {
    const score = calculateScore(page);
    expect(score.score).toBeGreaterThan(60);
    expect(score.grade).toMatch(/[ABCD]/);
    expect(score.breakdown.actions).toBeGreaterThan(0);
  });

  it("generates llms.txt content", () => {
    const text = generateLlmsTxt(config, [page]);
    expect(text).toContain("# Hyde Park");
    expect(text).toContain("[Available Units](/units)");
    expect(text).toContain("book_viewing");
    expect(text).toContain("Requires user confirmation");
  });

  it("generates agent.json", () => {
    const json = generateAgentJson(config);
    expect(json).toMatchObject({
      version: "0.1",
      site: { name: "Hyde Park", domain: "https://example.com" }
    });
  });

  it("generates actions.json from config, explicit actions, and forms", () => {
    const json = generateActionsJson(config, [page]) as { actions: Array<{ id: string }> };
    expect(json.actions.map((action) => action.id)).toContain("book_viewing");
    expect(json.actions.map((action) => action.id)).toContain("book_viewing_villa_a");
  });

  it("generates JSON-LD without inventing critical fields", () => {
    const jsonLd = generateJsonLd(config, page);
    expect(jsonLd.some((entry) => entry["@type"] === "WebSite")).toBe(true);
    expect(jsonLd.some((entry) => entry["@type"] === "Product")).toBe(true);
    expect(JSON.stringify(jsonLd)).toContain("12500000");
  });
});
