# Launch Copy

Use practical category messaging. Do not overclaim that `llms.txt` is universally consumed by agents.

## Teaser

I built a React/Next.js library that gives websites an agent-readiness score and generates llms.txt, agent.json, actions.json, JSON-LD, and safety metadata.

The goal: make websites readable, navigable, actionable, and safer for AI agents.

Launching this week.

## Main Launch Thread

1. Websites are built for humans. AI agents can click and read, but they often lack reliable context: what is this page, what are the entities, what actions are safe, and which forms require confirmation?

2. AgentNav is the agent-readiness layer for React and Next.js. It generates `/llms.txt`, `/.well-known/agent.json`, `/.well-known/actions.json`, JSON-LD, `data-agent-*` attributes, form metadata, warnings, and a readiness score.

3. React usage is explicit:

```tsx
<AgentAction id="book_viewing" type="book" risk="booking" requiresUserConfirmation>
  <button>Book Viewing</button>
</AgentAction>
```

4. The rendered UI becomes machine-readable:

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

5. Safety is conservative. Booking, payment, personal data, account changes, legal, medical, and destructive actions are not marked safe and require human confirmation.

6. The CLI gives a Lighthouse-style score:

```txt
Agent Readiness Score: 91/100 — A
```

7. If you build React or Next.js sites, I would love technical feedback on the model, metadata shape, safety rules, and examples.

GitHub: https://github.com/mido18/agentnav

## Hacker News

Title:

```txt
Show HN: AgentNav – Lighthouse for AI agents, for React and Next.js
```

Post:

```txt
I built AgentNav, an open source TypeScript library for making React and Next.js websites easier for AI agents to understand and act on safely.

It generates /llms.txt, /.well-known/agent.json, /.well-known/actions.json, Schema.org JSON-LD, data-agent-* attributes, form metadata, warnings, and an agent-readiness score.

The main design principle is safety: inferred booking/payment/contact/destructive actions are never marked safe, and sensitive actions require user confirmation.

The current MVP includes @agentnav/core, @agentnav/scanner, @agentnav/react, @agentnav/next, @agentnav/cli, and a Next.js real estate example app.

I am especially interested in feedback on the metadata model, safety rules, and whether this “agent-readiness” framing is useful for web developers.
```

## Product Hunt Maker Comment

AgentNav is an open source agent-readiness layer for React and Next.js.

The idea is simple: websites should expose enough structured metadata for AI agents to understand pages, entities, actions, forms, and safety rules without relying only on brittle visual clicking.

AgentNav generates `/llms.txt`, `agent.json`, `actions.json`, JSON-LD, `data-agent-*` attributes, form metadata, warnings, and a Lighthouse-style readiness score.

The MVP is developer-first and conservative about safety: booking, payment, personal data, account changes, legal, medical, and destructive actions require human confirmation.

I would love feedback from React, Next.js, SEO, and AI-agent builders.
