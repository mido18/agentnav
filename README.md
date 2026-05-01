# AgentNav

AgentNav is the agent-readiness layer for the web. It helps websites expose clear metadata, actions, forms, safety rules, and structured data so AI agents can navigate and act more reliably.

Modern websites are optimized for human browsing. AgentNav adds a machine-readable layer that tells AI agents what a page is about, which entities and actions exist, which forms are present, and which actions require explicit human confirmation.

## What It Generates

AgentNav can expose:

- `/llms.txt`
- `/.well-known/agent.json`
- `/.well-known/actions.json`
- Schema.org JSON-LD
- `data-agent-*` DOM attributes
- form metadata
- an agent-readiness score
- developer warnings and suggested fixes

## Packages

- `@agentnav/core`: shared types, Zod schemas, generators, scoring, safety normalization, and warnings.
- `@agentnav/scanner`: browser runtime scanner for the current page.
- `@agentnav/react`: React provider and metadata annotation components.
- `@agentnav/next`: Next.js config and route helpers.
- `@agentnav/cli`: `init`, `scan`, `score`, and `build` commands.
- `examples/next-real-estate`: working Next.js real estate example.

## Install

```bash
pnpm install
```

Build everything:

```bash
pnpm build
```

Run tests and lint:

```bash
pnpm test
pnpm lint
pnpm test:e2e
```

## React Usage

Wrap the app with `AgentNavProvider` and annotate important entities, fields, actions, and forms.

```tsx
import { AgentAction, AgentEntity, AgentField, AgentNavProvider } from "@agentnav/react";

export function App() {
  return (
    <AgentNavProvider
      siteName="Hyde Park"
      sitePurpose="Real estate sales"
      domain="https://example.com"
      enableRuntimeScanner
      enableDevOverlay
    >
      <AgentEntity type="real_estate_unit" id="villa-a" name="Villa Type A">
        <h2>Villa Type A</h2>
        <AgentField name="price" value={12500000} currency="EGP">
          12,500,000 EGP
        </AgentField>
        <AgentAction
          id="book_viewing"
          type="book"
          risk="booking"
          requiresUserConfirmation
          description="Book a viewing for Villa Type A"
        >
          <button>Book Viewing</button>
        </AgentAction>
      </AgentEntity>
    </AgentNavProvider>
  );
}
```

The rendered HTML includes attributes such as:

```html
<div data-agent-entity="real_estate_unit" data-agent-id="villa-a" data-agent-name="Villa Type A">
  <span data-agent-field="price" data-agent-value="12500000" data-agent-currency="EGP">
    12,500,000 EGP
  </span>
  <button
    data-agent-action="book_viewing"
    data-agent-action-type="book"
    data-agent-risk="booking"
    data-agent-requires-confirmation="true"
  >
    Book Viewing
  </button>
</div>
```

## Next.js Setup

Create `agentnav.config.ts`:

```ts
import { defineAgentNavConfig } from "@agentnav/next";

export default defineAgentNavConfig({
  siteName: "Hyde Park",
  domain: "https://example.com",
  purpose: "Real estate project website for browsing units and booking viewings",
  language: "en",
  importantPages: [
    {
      title: "Available Units",
      url: "/units",
      intent: "search_inventory",
      description: "Search and compare apartments, villas, and townhouses."
    }
  ],
  policies: {
    agentAllowed: ["read_content", "compare_options", "prepare_forms"],
    requiresConfirmation: ["submit_lead", "book_viewing", "make_payment"],
    disallowed: ["submit_payment_without_user_confirmation"]
  },
  actions: []
});
```

Add App Router route handlers:

```ts
// app/llms.txt/route.ts
import config from "../../agentnav.config";
import { createLlmsTxtRoute } from "@agentnav/next";

export const GET = createLlmsTxtRoute(config);
```

```ts
// app/.well-known/agent.json/route.ts
import config from "../../../agentnav.config";
import { createAgentJsonRoute } from "@agentnav/next";

export const GET = createAgentJsonRoute(config);
```

```ts
// app/.well-known/actions.json/route.ts
import config from "../../../agentnav.config";
import { createActionsJsonRoute } from "@agentnav/next";

export const GET = createActionsJsonRoute(config);
```

## Generated Files

`/llms.txt` is a human-readable Markdown guide for agents. It lists important pages, allowed tasks, confirmation rules, disallowed actions, and stable action summaries.

`/.well-known/agent.json` exposes site identity, policy, important pages, and related metadata file locations.

`/.well-known/actions.json` exposes stable actions from config, explicit React annotations, forms, and high-confidence scanned actions. Low-confidence inferred actions are not published as stable actions.

## Runtime Scanner

`@agentnav/scanner` inspects the current browser page and returns an `AgentPage` object:

```ts
import { scanCurrentPage } from "@agentnav/scanner";

const page = scanCurrentPage();
console.log(page.score.score, page.entities, page.actions, page.forms);
```

It scans document metadata, canonical URL, navigation, JSON-LD, explicit `data-agent-*` attributes, actions, forms, labels, and basic heuristic entities.

Invalid JSON-LD creates a warning instead of crashing.

## Readiness Score

Scores are out of 100:

- Page identity: 10
- Navigation clarity: 15
- Entity metadata: 15
- Action clarity: 20
- Form clarity: 15
- Structured data: 10
- Safety rules: 10
- Freshness: 5

Grades:

- `A`: 90-100
- `B`: 75-89
- `C`: 60-74
- `D`: 40-59
- `F`: 0-39

Warnings are actionable and include missing canonical URLs, invalid JSON-LD, generic duplicate action labels, unsafe sensitive actions, weak form labels, and missing freshness metadata.

## Safety Model

AgentNav never marks these actions as safe:

- spending money
- submitting personal data
- booking appointments
- canceling or deleting
- changing account settings
- submitting legal, medical, or financial information

Those actions are normalized to:

```json
{
  "safe": false,
  "requiresUserConfirmation": true
}
```

Explicit developer metadata has priority over inferred metadata. Heuristics can help warnings and local scans, but dangerous inferred actions are not published as safe stable actions.

## CLI

```bash
pnpm agentnav init
pnpm agentnav scan http://localhost:3000
pnpm agentnav score http://localhost:3000
pnpm agentnav build
```

`scan` opens a URL with Playwright and returns `AgentPage` JSON.

`score` prints a compact readiness summary:

```txt
Agent Readiness Score: 91/100 — A

High priority fixes:
1. No last-updated metadata found.
```

`build` reads `agentnav.config.ts` and writes:

```txt
public/llms.txt
public/.well-known/agent.json
public/.well-known/actions.json
```

## Example App

Run the example:

```bash
pnpm --filter next-real-estate dev
```

Then inspect:

- `http://localhost:3000/llms.txt`
- `http://localhost:3000/.well-known/agent.json`
- `http://localhost:3000/.well-known/actions.json`
- `http://localhost:3000/units`
- `http://localhost:3000/book-viewing`

Score the running app:

```bash
pnpm agentnav score http://localhost:3000/units
```

## Development Commands

From the repository root:

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm --filter next-real-estate dev
pnpm agentnav score http://localhost:3000/units
```

For Playwright e2e tests:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

## Known Limitations

- MVP support is focused on React and Next.js.
- Heuristic entity and action inference is intentionally conservative.
- No dashboard, database, hosted analytics, browser extension, MCP server, or AI classifier is included yet.
- Static generation uses config and supplied page snapshots; it does not crawl a production site by itself.
- Freshness scoring currently depends on visible JSON-LD date metadata.

## Roadmap

1. Dashboard
2. Agent-readiness browser extension
3. MCP endpoint generator
4. OpenAPI integration
5. WordPress plugin
6. Shopify plugin
7. Rails gem
8. Agent analytics
9. Signed metadata
10. Agent payment policy support
11. Prompt-injection scanner
12. Agent journey testing
