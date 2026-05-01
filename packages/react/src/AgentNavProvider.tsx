"use client";

import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { AgentAction, AgentEntity, AgentForm, AgentPage, AgentSiteConfig } from "@agentnav/core";
import { scanCurrentPage } from "@agentnav/scanner";

export type AgentNavProviderProps = React.PropsWithChildren<{
  siteName: string;
  sitePurpose: string;
  domain: string;
  language?: string;
  enableRuntimeScanner?: boolean;
  enableDevOverlay?: boolean;
  jsonLd?: Record<string, unknown>[];
}>;

export type AgentNavContextValue = {
  config: AgentSiteConfig;
  entities: AgentEntity[];
  actions: AgentAction[];
  forms: AgentForm[];
  lastScan?: AgentPage;
  registerEntity: (entity: AgentEntity) => void;
  registerAction: (action: AgentAction) => void;
  registerForm: (form: AgentForm) => void;
  scan: () => AgentPage | undefined;
};

export const AgentNavContext = createContext<AgentNavContextValue | null>(null);

declare global {
  interface Window {
    AgentNav?: {
      config: AgentSiteConfig;
      entities: AgentEntity[];
      actions: AgentAction[];
      forms: AgentForm[];
      lastScan?: AgentPage;
      scan: () => AgentPage | undefined;
    };
  }
}

function upsertById<T extends { id: string }>(items: T[], item: T): T[] {
  const index = items.findIndex((candidate) => candidate.id === item.id);
  if (index === -1) return [...items, item];
  return items.map((candidate, candidateIndex) => (candidateIndex === index ? item : candidate));
}

export function AgentNavProvider({
  siteName,
  sitePurpose,
  domain,
  language,
  enableRuntimeScanner = false,
  enableDevOverlay = false,
  jsonLd = [],
  children
}: AgentNavProviderProps): React.ReactElement {
  const config = useMemo<AgentSiteConfig>(
    () => ({
      siteName,
      domain,
      purpose: sitePurpose,
      ...(language ? { language } : {})
    }),
    [domain, language, siteName, sitePurpose]
  );
  const [entities, setEntities] = useState<AgentEntity[]>([]);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [forms, setForms] = useState<AgentForm[]>([]);
  const [lastScan, setLastScan] = useState<AgentPage | undefined>();

  const registerEntity = useCallback((entity: AgentEntity) => setEntities((items) => upsertById(items, entity)), []);
  const registerAction = useCallback((action: AgentAction) => setActions((items) => upsertById(items, action)), []);
  const registerForm = useCallback((form: AgentForm) => setForms((items) => upsertById(items, form)), []);

  const scan = useCallback(() => {
    if (typeof window === "undefined") return undefined;
    const page = scanCurrentPage();
    setLastScan(page);
    return page;
  }, []);

  const context = useMemo<AgentNavContextValue>(
    () => ({
      config,
      entities,
      actions,
      forms,
      ...(lastScan ? { lastScan } : {}),
      registerEntity,
      registerAction,
      registerForm,
      scan
    }),
    [actions, config, entities, forms, lastScan, registerAction, registerEntity, registerForm, scan]
  );

  useEffect(() => {
    window.AgentNav = {
      config,
      entities,
      actions,
      forms,
      ...(lastScan ? { lastScan } : {}),
      scan
    };
  }, [actions, config, entities, forms, lastScan, scan]);

  useEffect(() => {
    if (enableRuntimeScanner) scan();
  }, [enableRuntimeScanner, scan]);

  return (
    <AgentNavContext.Provider value={context}>
      {jsonLd.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      {children}
      {enableDevOverlay && lastScan ? (
        <aside
          data-agent-dev-overlay="true"
          style={{
            position: "fixed",
            right: 12,
            bottom: 12,
            zIndex: 2147483647,
            background: "#111827",
            color: "#fff",
            borderRadius: 6,
            padding: "8px 10px",
            font: "12px/1.4 system-ui, sans-serif",
            boxShadow: "0 8px 24px rgba(0,0,0,0.22)"
          }}
        >
          AgentNav {lastScan.score.score}/100 {lastScan.score.grade}
        </aside>
      ) : null}
    </AgentNavContext.Provider>
  );
}
