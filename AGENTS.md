# Agent instructions

This repository is built with the Software Factory, on its `web-app` Domain Pack: Web apps and HTTP APIs on Node, with a real browser for screenshots.

## Before you change anything

1. Read `docs/codebase-map/map.md`, the Codebase Map: every module, what it depends on and what it offers. Read it before exploring.
2. Read `GLOSSARY.md` if there is one, and use its terms in code and in what you write.
3. The Spec for your work is in `docs/specs/`, and the decisions behind the code are in `docs/adr/`. Read any ADR whose title touches what you're changing before going against it.

## Tests

Run the tests with `npm test`. Write a test from each Acceptance Criterion before the code, and watch it fail first. A test that only checks mocks, or that repeats the code's own logic, proves nothing.

## Observability Baseline

Every new code path must have:

- Structured logs, with each HTTP request's method, route, status and duration
- Errors captured with context and never swallowed, and no stack trace in what a client sees
- OTel traces at module boundaries, including every request handler and outgoing call
- A health endpoint that answers only when the app can serve

## Protected Paths

Agents can't change these, however a file is written: `.github/workflows/**`, `.env*`, `.factory/**`, `AGENTS.md`, `CLAUDE.md`, `.claude/**`, `docs/codebase-map/**`, `*.pem`, `*.key`, `*.p12`, `*.pfx`, `id_rsa`, `id_dsa`, `id_ecdsa`, `id_ed25519`, `**/.ssh/**`, `**/secrets/**`, `.npmrc`, except `.env.example`. `.factory/guardrails.yaml` records them. If your work can't be done without changing one, ask for it rather than working around it.

## Secrets

`.env` and `.env.agent` are never committed. When code needs a new key, add it to `.env.example` with a one-line description and no value.
