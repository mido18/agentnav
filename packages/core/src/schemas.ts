import { z } from "zod";

export const AgentRiskSchema = z.enum([
  "none",
  "shares_personal_data",
  "booking",
  "payment",
  "account_change",
  "legal",
  "medical",
  "destructive",
  "unknown"
]);

export const AgentConfidenceSchema = z.number().min(0).max(1);

export const AgentEntitySchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "product",
    "service",
    "article",
    "real_estate_unit",
    "organization",
    "person",
    "event",
    "faq",
    "unknown"
  ]),
  name: z.string().optional(),
  description: z.string().optional(),
  url: z.string().optional(),
  fields: z.record(z.unknown()).optional(),
  confidence: AgentConfidenceSchema,
  source: z.enum(["explicit", "jsonld", "semantic_html", "heuristic", "ai"])
});

export const AgentActionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum([
    "navigate",
    "search",
    "compare",
    "submit_form",
    "book",
    "buy",
    "contact",
    "download",
    "cancel",
    "unknown"
  ]),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional(),
  endpoint: z.string().optional(),
  elementPath: z.string().optional(),
  inputSchema: z.record(z.unknown()).optional(),
  safe: z.boolean(),
  requiresUserConfirmation: z.boolean(),
  risk: AgentRiskSchema,
  confidence: AgentConfidenceSchema,
  source: z.enum(["explicit", "form", "button", "link", "config", "heuristic"])
});

export const AgentFormFieldSchema = z.object({
  name: z.string().min(1),
  label: z.string().optional(),
  type: z.string().optional(),
  required: z.boolean(),
  placeholder: z.string().optional(),
  autocomplete: z.string().optional(),
  pattern: z.string().optional(),
  min: z.string().optional(),
  max: z.string().optional(),
  options: z.array(z.string()).optional(),
  agentPurpose: z.string().optional(),
  confidence: AgentConfidenceSchema
});

export const AgentFormSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  method: z.string(),
  action: z.string().optional(),
  fields: z.array(AgentFormFieldSchema),
  submitLabel: z.string().optional(),
  requiresUserConfirmation: z.boolean(),
  risk: AgentRiskSchema,
  confidence: AgentConfidenceSchema
});

export const AgentNavLinkSchema = z.object({
  text: z.string().min(1),
  href: z.string().min(1),
  purpose: z.string().optional(),
  confidence: AgentConfidenceSchema
});

export const AgentWarningSchema = z.object({
  severity: z.enum(["low", "medium", "high"]),
  code: z.string().min(1),
  message: z.string().min(1),
  fix: z.string().optional()
});

export const AgentReadinessScoreSchema = z.object({
  score: z.number().min(0).max(100),
  grade: z.enum(["A", "B", "C", "D", "F"]),
  breakdown: z.object({
    pageIdentity: z.number().min(0).max(10),
    navigation: z.number().min(0).max(15),
    entities: z.number().min(0).max(15),
    actions: z.number().min(0).max(20),
    forms: z.number().min(0).max(15),
    structuredData: z.number().min(0).max(10),
    safety: z.number().min(0).max(10),
    freshness: z.number().min(0).max(5)
  }),
  warnings: z.array(AgentWarningSchema)
});

export const AgentPageSchema = z.object({
  url: z.string(),
  title: z.string(),
  description: z.string().optional(),
  language: z.string().optional(),
  canonicalUrl: z.string().optional(),
  entities: z.array(AgentEntitySchema),
  actions: z.array(AgentActionSchema),
  forms: z.array(AgentFormSchema),
  navigation: z.array(AgentNavLinkSchema),
  jsonLd: z.array(z.record(z.unknown())),
  warnings: z.array(AgentWarningSchema),
  score: AgentReadinessScoreSchema
});

export const AgentSiteConfigSchema = z.object({
  siteName: z.string().min(1),
  domain: z.string().min(1),
  purpose: z.string().min(1),
  language: z.string().optional(),
  importantPages: z
    .array(
      z.object({
        title: z.string().min(1),
        url: z.string().min(1),
        intent: z.string().optional(),
        description: z.string().optional()
      })
    )
    .optional(),
  actions: z.array(AgentActionSchema).optional(),
  policies: z
    .object({
      agentAllowed: z.array(z.string()).optional(),
      requiresConfirmation: z.array(z.string()).optional(),
      disallowed: z.array(z.string()).optional()
    })
    .optional(),
  business: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
      sameAs: z.array(z.string()).optional()
    })
    .optional()
});
