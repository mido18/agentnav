export type AgentRisk =
  | "none"
  | "shares_personal_data"
  | "booking"
  | "payment"
  | "account_change"
  | "legal"
  | "medical"
  | "destructive"
  | "unknown";

export type AgentConfidence = number;

export type AgentEntity = {
  id: string;
  type:
    | "product"
    | "service"
    | "article"
    | "real_estate_unit"
    | "organization"
    | "person"
    | "event"
    | "faq"
    | "unknown";
  name?: string;
  description?: string;
  url?: string;
  fields?: Record<string, unknown>;
  confidence: AgentConfidence;
  source: "explicit" | "jsonld" | "semantic_html" | "heuristic" | "ai";
};

export type AgentAction = {
  id: string;
  name: string;
  description?: string;
  type:
    | "navigate"
    | "search"
    | "compare"
    | "submit_form"
    | "book"
    | "buy"
    | "contact"
    | "download"
    | "cancel"
    | "unknown";
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint?: string;
  elementPath?: string;
  inputSchema?: Record<string, unknown>;
  safe: boolean;
  requiresUserConfirmation: boolean;
  risk: AgentRisk;
  confidence: AgentConfidence;
  source: "explicit" | "form" | "button" | "link" | "config" | "heuristic";
};

export type AgentFormField = {
  name: string;
  label?: string;
  type?: string;
  required: boolean;
  placeholder?: string;
  autocomplete?: string;
  pattern?: string;
  min?: string;
  max?: string;
  options?: string[];
  agentPurpose?: string;
  confidence: AgentConfidence;
};

export type AgentForm = {
  id: string;
  name?: string;
  method: string;
  action?: string;
  fields: AgentFormField[];
  submitLabel?: string;
  requiresUserConfirmation: boolean;
  risk: AgentRisk;
  confidence: AgentConfidence;
};

export type AgentNavLink = {
  text: string;
  href: string;
  purpose?: string;
  confidence: AgentConfidence;
};

export type AgentWarning = {
  severity: "low" | "medium" | "high";
  code: string;
  message: string;
  fix?: string;
};

export type AgentReadinessScore = {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  breakdown: {
    pageIdentity: number;
    navigation: number;
    entities: number;
    actions: number;
    forms: number;
    structuredData: number;
    safety: number;
    freshness: number;
  };
  warnings: AgentWarning[];
};

export type AgentPage = {
  url: string;
  title: string;
  description?: string;
  language?: string;
  canonicalUrl?: string;
  entities: AgentEntity[];
  actions: AgentAction[];
  forms: AgentForm[];
  navigation: AgentNavLink[];
  jsonLd: Record<string, unknown>[];
  warnings: AgentWarning[];
  score: AgentReadinessScore;
};

export type AgentSiteConfig = {
  siteName: string;
  domain: string;
  purpose: string;
  language?: string;
  importantPages?: {
    title: string;
    url: string;
    intent?: string;
    description?: string;
  }[];
  actions?: AgentAction[];
  policies?: {
    agentAllowed?: string[];
    requiresConfirmation?: string[];
    disallowed?: string[];
  };
  business?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    sameAs?: string[];
  };
};

export type AgentPageInput = Omit<AgentPage, "score"> & {
  score?: AgentReadinessScore;
};
