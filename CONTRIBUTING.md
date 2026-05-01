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

## Publishing

The scoped packages are configured for public npm publishing with
`publishConfig.access`. If npm returns `E403` with
`Two-factor authentication or granular access token with bypass 2fa enabled is
required`, the package metadata is ready but the npm account or token is not.

For a manual release, enable npm 2FA for publish/write actions on the publishing
account, then pass the current one-time password:

```bash
pnpm build
pnpm run release:dry-run
pnpm run release:publish -- --otp=<six-digit-code>
```

For a non-interactive release, use a granular npm access token with read/write
access to the `@agentnav` scope and `Bypass 2FA` enabled. In CI, expose it via
`NODE_AUTH_TOKEN` and an npm registry auth entry such as
`//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}`.

Use `pnpm publish` for workspace releases instead of running `npm publish` in
each package. pnpm rewrites `workspace:*` dependencies to real package versions
when packing and publishing.

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
