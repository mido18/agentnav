# How to make a Next.js site readable by AI agents

Websites are built for humans. AI agents can read pages and click buttons, but they often need more context before acting reliably:

- What is this page about?
- What entities exist on the page?
- Which buttons are available actions?
- Which forms collect personal data?
- Which actions are safe?
- Which actions require human confirmation?

AgentNav is an open source agent-readiness layer for React and Next.js. It adds structured metadata, action annotations, form metadata, safety rules, generated files, and a readiness score.

## Add React annotations

```tsx
import { AgentAction, AgentEntity, AgentField } from "@agentnav/react";

export function ListingCard() {
  return (
    <AgentEntity type="real_estate_unit" id="villa-a" name="Villa Type A">
      <h2>Villa Type A</h2>
      <AgentField name="price" value={12500000} currency="EGP">
        12,500,000 EGP
      </AgentField>
      <AgentAction id="book_viewing" type="book" risk="booking" requiresUserConfirmation>
        <button>Book Viewing</button>
      </AgentAction>
    </AgentEntity>
  );
}
```

This renders machine-readable attributes:

```html
<button
  data-agent-action="book_viewing"
  data-agent-action-type="book"
  data-agent-risk="booking"
  data-agent-requires-confirmation="true"
>
  Book Viewing
</button>
```

## Publish metadata routes

```ts
// app/llms.txt/route.ts
import config from "../../agentnav.config";
import { createLlmsTxtRoute } from "@agentnav/next";

export const GET = createLlmsTxtRoute(config);
```

AgentNav can also publish:

- `/.well-known/agent.json`
- `/.well-known/actions.json`
- Schema.org JSON-LD

## Score the page

```bash
pnpm agentnav score http://localhost:3000/units
```

Example:

```txt
Agent Readiness Score: 91/100 — A
```

The score checks page identity, navigation, entities, actions, forms, structured data, safety, and freshness.

## Safety matters

AgentNav is conservative. It does not mark sensitive actions as safe. Booking, payment, personal data, account changes, legal, medical, and destructive actions require human confirmation.

That matters because agent-readiness is not just about making actions easier to automate. It is also about making actions easier to understand and safer to perform.

## Try it

GitHub: https://github.com/mido18/agentnav
