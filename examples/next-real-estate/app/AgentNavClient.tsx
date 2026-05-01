"use client";

import { AgentNavProvider } from "@agentnav/react";

export function AgentNavClient({ children }: { children: React.ReactNode }) {
  return (
    <AgentNavProvider
      siteName="Hyde Park"
      sitePurpose="Real estate sales"
      domain="https://example.com"
      enableRuntimeScanner
      enableDevOverlay
    >
      {children}
    </AgentNavProvider>
  );
}
