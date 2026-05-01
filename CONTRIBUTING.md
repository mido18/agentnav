# Contributing to AgentNav

AgentNav is the agent-readiness layer for React and Next.js.

## Local Setup

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
```

For e2e tests:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

## Contribution Guidelines

- Keep safety conservative. Sensitive actions must not be marked safe.
- Prefer explicit developer metadata over inference.
- Add tests for generators, scanners, scoring, or public API changes.
- Keep new dependencies minimal.
- Keep examples realistic and easy to inspect.

## Good First Issues

Good starter areas:

- documentation examples
- additional scanner fixtures
- small warning improvements
- example app variants
- README and launch material polish
