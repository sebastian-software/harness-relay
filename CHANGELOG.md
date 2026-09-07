# Changelog

All notable changes to this project are documented here. The first public
release is intentionally kept small and local-first.

## [1.0.0](https://github.com/sebastian-software/harness-relay/compare/v0.1.0...v1.0.0) (2026-09-07)


### ⚠ BREAKING CHANGES

* the package is published as `harness-relay` instead of `@sebastian-software/agent-bridge`, and it installs a `harness-relay` executable instead of `agent-bridge`.

### Features

* rename the tool to harness-relay ([#133](https://github.com/sebastian-software/harness-relay/issues/133)) ([50de2b6](https://github.com/sebastian-software/harness-relay/commit/50de2b62aef336c8a2f651128a0e86d023d8f8ef))


### Bug Fixes

* clarify startup and interaction evidence ([#116](https://github.com/sebastian-software/harness-relay/issues/116)) ([2194589](https://github.com/sebastian-software/harness-relay/commit/21945890c24b68171601d5e200793acd07aa495b))
* confirm Claude effects after tool results ([#115](https://github.com/sebastian-software/harness-relay/issues/115)) ([1b86a38](https://github.com/sebastian-software/harness-relay/commit/1b86a3868b77b676d56d67eb0f84f2c78c649a24))
* let autostarted CLI exit cleanly ([#113](https://github.com/sebastian-software/harness-relay/issues/113)) ([5ef4947](https://github.com/sebastian-software/harness-relay/commit/5ef4947a5c8db11fd3bf47c428949bbc84413ed1))
* preserve requested model aliases ([#114](https://github.com/sebastian-software/harness-relay/issues/114)) ([3632c0e](https://github.com/sebastian-software/harness-relay/commit/3632c0ed9bf7675c5dea041818aa08f715ff1e6e))

## [0.1.0] - 2026-09-05

- Added qualified Claude Code, Codex, and deterministic fake adapters.
- Added the local broker with durable events, outcomes, effects, retention,
  cancellation, timeout, restart reconciliation, and policy evidence.
- Added the CLI, typed TypeScript client, MCP projection, and contract schemas.
- Added developer tooling, coverage, package metadata, and user documentation.
