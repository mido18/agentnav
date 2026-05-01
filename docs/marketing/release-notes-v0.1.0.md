# AgentNav 0.1: agent-readiness for React and Next.js

AgentNav 0.1 is the first public MVP of the agent-readiness layer for React and Next.js.

## Highlights

- Generate `/llms.txt` from a site config.
- Publish `/.well-known/agent.json` and `/.well-known/actions.json` with Next.js route helpers.
- Annotate React UI with `data-agent-*` attributes using `AgentEntity`, `AgentField`, `AgentAction`, and `AgentForm`.
- Scan pages in the browser and return an `AgentPage` object with entities, actions, forms, JSON-LD, warnings, and score.
- Score agent-readiness across identity, navigation, entities, actions, forms, structured data, safety, and freshness.
- Enforce conservative safety defaults for booking, payment, personal data, account changes, legal, medical, and destructive actions.
- Use CLI commands for `init`, `scan`, `score`, and static `build`.
- Includes a working Next.js real estate example.

## Install

```bash
pnpm add @agentnav/react @agentnav/next
```

## Try The Example

```bash
pnpm install
pnpm --filter next-real-estate dev
pnpm agentnav score http://localhost:3000/units
```

## Known Limitations

- React and Next.js are the first supported integrations.
- `llms.txt` is an emerging convention and not guaranteed to be consumed by every agent.
- Heuristic inference is conservative by design.
- Hosted dashboard, browser extension, MCP server, and analytics are future roadmap items.
