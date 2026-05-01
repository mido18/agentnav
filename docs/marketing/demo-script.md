# 90-Second Demo Script

Goal: show a React/Next.js developer that AgentNav can make a site agent-readable in minutes.

## Recording Setup

- Browser left: `examples/next-real-estate` running at `http://localhost:3000`.
- Editor right: listing component and `agentnav.config.ts`.
- Terminal bottom: `pnpm agentnav score http://localhost:3000/units`.
- Keep zoom high enough for mobile viewers.

## Script

0-10s: Problem.

> AI agents can read websites, but they do not know which content is critical, which actions are safe, or which forms need human confirmation.

10-25s: Show the library.

> AgentNav is the agent-readiness layer for React and Next.js. It adds structured metadata, safe action annotations, and a Lighthouse-style score.

25-45s: Show component annotation.

Show `AgentEntity`, `AgentField`, and `AgentAction` around the real estate listing.

> This listing is now machine-readable: the unit, price, bedrooms, and booking button are explicit.

45-60s: Show generated metadata.

Open:

- `/llms.txt`
- `/.well-known/agent.json`
- `/.well-known/actions.json`

> Next.js routes publish the agent guide, site policy, and stable actions.

60-75s: Show safety.

Highlight:

```html
data-agent-risk="booking"
data-agent-requires-confirmation="true"
```

> Sensitive actions are not marked safe. Booking, payment, personal data, account changes, legal, medical, and destructive actions require human confirmation.

75-90s: Show score.

Run:

```bash
pnpm agentnav score http://localhost:3000/units
```

End on:

```txt
Agent Readiness Score: 91/100 — A
```

> If you build React or Next.js sites, AgentNav helps you make them readable, navigable, actionable, and safer for AI agents.
