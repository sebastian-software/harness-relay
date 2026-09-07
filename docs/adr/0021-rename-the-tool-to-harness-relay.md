# ADR-0021: Rename the tool to harness-relay

- **Status:** Accepted
- **Date:** 2026-09-07

## Context

The tool shipped in this repository was developed under the name
`agent-bridge` and was going to be published as
`@sebastian-software/agent-bridge`. Three facts settled against that name.

The unscoped npm name `agent-bridge` is already taken by an unrelated package,
so keeping the name meant keeping the scope. The organization does not
namespace its published packages: the sibling tools are published under plain
names. And the scoped name reads as an internal artifact rather than a tool
anyone can install, which is the opposite of what a public developer preview
needs.

`harness-relay` is free on npm and reserved by the owner as
`harness-relay@0.0.0`. It also says what the tool does more precisely than the
old name did: it relays one bounded invocation between installed harnesses.

Version 0.1.0 exists as a hand-written changelog entry only. Nothing has been
published to npm, so no external consumer is affected. The cost of the rename
is one-time and local to developer machines.

## Decision

The tool is `harness-relay`, written "Harness Relay" where a product name is
spelled as words and `harness-relay` everywhere else — package name,
executable, MCP server name, configuration and runtime paths, and schema
identifiers.

The rename covers:

- the npm package name and the single `bin` entry, both `harness-relay`;
- the environment variable prefix, `AGENT_BRIDGE_*` becomes `HARNESS_RELAY_*`;
- the configuration file, `~/.config/harness-relay/config.json`;
- the runtime and state directories, `$XDG_RUNTIME_DIR/harness-relay` and
  `~/.local/state/harness-relay`, and the socket inside them;
- the MCP server name and its `harness_relay_*` tool prefix;
- the schema `$id` scheme, `harness-relay://schemas/...`, and the schema
  titles;
- the release-please component, and with it the npm package the publish
  workflow releases;
- the exported client class, `HarnessRelayClient`.

Two things deliberately do not change.

The component vocabulary stays "bridge": `BridgeError`, `appendBridgeEvent`,
"bridge operation", and "bridge-owned invocation identity" keep their names.
They describe what the component does between two harnesses, they are anchored
in ADR-0016 and in the glossary, and renaming them would churn the contract
surface without making anything clearer.

The decision records numbered 0001 to 0020 keep their text, including the old
tool name where they spell it. They are the record of what was decided when it
was decided; this ADR is the pointer that says the tool named there is the tool
named here. `CONTEXT.md` carries the same pointer for readers who start at the
glossary.

## Migration

There is no compatibility shim, because there is no released version to be
compatible with. A developer who ran the tool from a local checkout does this
once:

- rename `~/.config/agent-bridge/` to `~/.config/harness-relay/`, or let the
  tool recreate the configuration;
- rename `~/.local/state/agent-bridge/` to `~/.local/state/harness-relay/` to
  keep retained invocations, or delete it to start clean;
- stop any broker started before the rename, because it listens on the old
  socket path; the next client autostarts a broker on the new one;
- rename any `AGENT_BRIDGE_*` variable exported in a shell profile or CI job
  to `HARNESS_RELAY_*`;
- re-register the MCP server under its new name, and update tool names from
  `agent_bridge_*` to `harness_relay_*`.

Until that is done, the process adapter keeps stripping the pre-rename
`AGENT_BRIDGE_*` prefix alongside `HARNESS_RELAY_*`, so a stale export in a
shell or CI job cannot leak into a harness process during the migration window;
the second prefix is removed once the window closes.

The legacy `$XDG_RUNTIME_DIR/broker.sock` fallback recorded in ADR-0020's issue
trail is unaffected: it predates the scoped directory and is removed on its own
schedule.

## Consequences

- The package installs as `harness-relay`, and `npx harness-relay routes`
  works without a scope.
- Trusted Publishing on npm has to be configured for `harness-relay` bound to
  this repository and `publish.yml` before the first release. That is the one
  manual owner step.
- The GitHub repository is renamed separately by the owner; GitHub redirects
  the old paths, so links keep resolving either way.
- Every contract surface that carries the name — schema `$id`s, MCP tool
  names, the CLI executable — changes at once, before the first publish, so
  there is exactly one break instead of several.
